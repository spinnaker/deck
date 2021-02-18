//@ts-nocheck
import * as React from 'react';
import { cloneDeep } from 'lodash';
import {
  FirewallLabels,
  ILoadBalancerModalProps,
  LoadBalancerWriter,
  ReactInjector,
  ReactModal,
  TaskMonitor,
  WizardModal,
  WizardPage,
  noop,
} from '@spinnaker/core';

import {
  ITencentcloudApplicationLoadBalancer,
  ITencentcloudApplicationLoadBalancerUpsertCommand,
} from 'tencentcloud/domain';
import { TencentcloudReactInjector } from 'tencentcloud/reactShims';

import { LBListeners } from './LBListeners';
import { LoadBalancerLocation } from '../common/LoadBalancerLocation';
import { SecurityGroups } from '../common/SecurityGroups';
import '../common/configure.less';

export interface ICreateApplicationLoadBalancerProps extends ILoadBalancerModalProps {
  loadBalancer: ITencentcloudApplicationLoadBalancer;
}

export interface ICreateApplicationLoadBalancerState {
  includeSecurityGroups: boolean;
  isNew: boolean;
  loadBalancerCommand: ITencentcloudApplicationLoadBalancerUpsertCommand;
  taskMonitor: TaskMonitor;
}

export class CreateApplicationLoadBalancer extends React.Component<
  ICreateApplicationLoadBalancerProps,
  ICreateApplicationLoadBalancerState
> {
  public static defaultProps: Partial<ICreateApplicationLoadBalancerProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  private _isUnmounted = false;
  private refreshUnsubscribe: () => void;

  public static show(
    props: ICreateApplicationLoadBalancerProps,
  ): Promise<ITencentcloudApplicationLoadBalancerUpsertCommand> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(CreateApplicationLoadBalancer, props, modalProps);
  }

  constructor(props: ICreateApplicationLoadBalancerProps) {
    super(props);
    const loadBalancerCommand = props.command
      ? (props.command as ITencentcloudApplicationLoadBalancerUpsertCommand) // ejecting from a wizard
      : props.loadBalancer
      ? TencentcloudReactInjector.tencentcloudLoadBalancerTransformer.convertApplicationLoadBalancerForEditing(
          props.loadBalancer,
        )
      : TencentcloudReactInjector.tencentcloudLoadBalancerTransformer.constructNewApplicationLoadBalancerTemplate(
          props.app,
        );

    this.state = {
      includeSecurityGroups: !!loadBalancerCommand.vpcId,
      isNew: !props.loadBalancer,
      loadBalancerCommand,
      taskMonitor: null,
    };
  }

  protected certificateIdAsARN(
    accountId: string,
    certificateId: string,
    region: string,
    certificateType: string,
  ): string {
    if (
      certificateId &&
      (certificateId.indexOf('arn:tencentcloud:iam::') !== 0 || certificateId.indexOf('arn:tencentcloud:acm:') !== 0)
    ) {
      // If they really want to enter the ARN...
      if (certificateType === 'iam') {
        return `arn:tencentcloud:iam::${accountId}:server-certificate/${certificateId}`;
      }
      if (certificateType === 'acm') {
        return `arn:tencentcloud:acm:${region}:${accountId}:certificate/${certificateId}`;
      }
    }
    return certificateId;
  }

  private formatListeners(command: ITencentcloudApplicationLoadBalancerUpsertCommand): void {
    command.listener = command.listeners.map(listener => {
      if (listener.healthCheck) {
        delete listener.healthCheck.showAdvancedSetting;
      }
      if (listener.rules && listener.rules.length) {
        listener.rules = listener.rules.map(r => {
          delete r.healthCheck.showAdvancedSetting;
          return r;
        });
      }
      if (listener.protocol === 'HTTP' || listener.protocol === 'HTTPS') {
        delete listener.healthCheck;
      } else {
        delete listener.rules;
      }
      delete listener.isNew;
      return listener;
    });
  }

  private formatCommand(base: ITencentcloudApplicationLoadBalancerUpsertCommand): any {
    const { app } = this.props;
    const command = {
      type: 'upsertLoadBalancer',
      cloudProvider: 'tencentcloud',
      application: app.name,
      stack: base.stack,
      detail: base.detail,
      account: base.credentials,
      accountName: base.credentials,
      credentials: base.credentials,
      loadBalancerId: base.loadBalancerId,
      loadBalancerName: base.name,
      name: base.name,
      region: base.region,
      vpcId: base.vpcId,
      subnetId: base.isInternal ? base.subnetType : undefined,
      loadBalancerType: base.isInternal ? 'INTERNAL' : 'OPEN',
      securityGroups: base.isInternal ? undefined : base.securityGroups,
      listener: base.listener,
    };
    return command;
  }

  protected onApplicationRefresh(values: ITencentcloudApplicationLoadBalancerUpsertCommand): void {
    if (this._isUnmounted) {
      return;
    }

    this.refreshUnsubscribe = undefined;
    this.props.dismissModal();
    this.setState({ taskMonitor: undefined });
    const newStateParams = {
      name: values.name,
      accountId: values.credentials,
      region: values.region,
      vpcId: values.vpcId,
      provider: 'tencentcloud',
    };

    if (!ReactInjector.$state.includes('**.loadBalancerDetails')) {
      ReactInjector.$state.go('.loadBalancerDetails', newStateParams);
    } else {
      ReactInjector.$state.go('^.loadBalancerDetails', newStateParams);
    }
  }

  public componentWillUnmount(): void {
    this._isUnmounted = true;
    if (this.refreshUnsubscribe) {
      this.refreshUnsubscribe();
    }
  }

  private onTaskComplete(values: ITencentcloudApplicationLoadBalancerUpsertCommand): void {
    this.props.app.loadBalancers.refresh();
    this.refreshUnsubscribe = this.props.app.loadBalancers.onNextRefresh(null, () => this.onApplicationRefresh(values));
  }

  private submit = (values: ITencentcloudApplicationLoadBalancerUpsertCommand): void => {
    const { app, forPipelineConfig, closeModal } = this.props;
    const { isNew } = this.state;

    const descriptor = isNew ? 'Create' : 'Update';
    const loadBalancerCommandFormatted = cloneDeep(values);

    if (forPipelineConfig) {
      this.formatListeners(loadBalancerCommandFormatted);
      closeModal && closeModal(loadBalancerCommandFormatted);
    } else {
      const taskMonitor = new TaskMonitor({
        application: app,
        title: `${isNew ? 'Creating' : 'Updating'} your load balancer`,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
        onTaskComplete: () => this.onTaskComplete(loadBalancerCommandFormatted),
      });

      taskMonitor.submit(() => {
        this.formatListeners(loadBalancerCommandFormatted);
        return LoadBalancerWriter.upsertLoadBalancer(this.formatCommand(loadBalancerCommandFormatted), app, descriptor);
      });

      this.setState({ taskMonitor });
    }
  };

  public render() {
    const { app, dismissModal, forPipelineConfig, loadBalancer } = this.props;
    const { isNew, loadBalancerCommand, taskMonitor } = this.state;

    let heading = forPipelineConfig ? 'Configure Application Load Balancer' : 'Create New Application Load Balancer';
    if (!isNew) {
      heading = `Edit ${loadBalancerCommand.name}: ${loadBalancerCommand.region}: ${loadBalancerCommand.credentials}`;
    }
    return (
      <WizardModal<ITencentcloudApplicationLoadBalancerUpsertCommand>
        heading={heading}
        initialValues={loadBalancerCommand}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        closeModal={this.submit}
        submitButtonLabel={forPipelineConfig ? (isNew ? 'Add' : 'Done') : isNew ? 'Create' : 'Update'}
        render={({ formik, nextIdx, wizard }) => {
          const showLocationSection = isNew || forPipelineConfig;
          const isInternalLoadBalancer = !!formik && formik.values && formik.values.isInternal;
          return (
            <>
              {showLocationSection && (
                <WizardPage
                  label="Location"
                  wizard={wizard}
                  order={nextIdx()}
                  render={({ innerRef }) => (
                    <LoadBalancerLocation
                      app={app}
                      forPipelineConfig={forPipelineConfig}
                      formik={formik}
                      isNew={isNew}
                      loadBalancer={loadBalancer}
                      ref={innerRef}
                    />
                  )}
                />
              )}
              {!isInternalLoadBalancer && (
                <WizardPage
                  label={FirewallLabels.get('Firewalls')}
                  wizard={wizard}
                  order={nextIdx()}
                  render={({ innerRef, onLoadingChanged }) => (
                    <SecurityGroups formik={formik} isNew={isNew} onLoadingChanged={onLoadingChanged} ref={innerRef} />
                  )}
                />
              )}
              <WizardPage
                label="Listeners"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => <LBListeners isNewLB={isNew} ref={innerRef} app={app} formik={formik} />}
              />
            </>
          );
        }}
      />
    );
  }
}
