import * as React from 'react';
import {
  FirewallLabels,
  ReactModal,
  WizardModal,
  WizardPage,
  noop,
  TaskMonitor,
  ReactInjector,
  SecurityGroupWriter,
} from '@spinnaker/core';
import { ISecurityGroup } from '@spinnaker/core';
import { ISecurityGroupProps, ISecurityGroupDetail } from '../interface';
import { SecurityGroupLocation } from './components/SecurityGroupLocation';
import { SecurityGroupIngress } from './components/SecurityGroupIngress';
export interface ICreateSecurityGroupState {
  taskMonitor: TaskMonitor;
  securityGroup: ISecurityGroupDetail;
}

export class CreateSecurityGroupModal extends React.Component<ISecurityGroupProps, ICreateSecurityGroupState> {
  public static defaultProps: Partial<ISecurityGroupProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: ISecurityGroupProps): Promise<ISecurityGroup> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(CreateSecurityGroupModal, props, modalProps);
  }

  constructor(props: ISecurityGroupProps) {
    super(props);
    this.state = {
      taskMonitor: null,
      securityGroup: {},
    };
  }

  componentDidMount() {}

  private getAccount = () => this.state.securityGroup.accountName || this.state.securityGroup.credentials;

  protected onApplicationRefresh = (): void => {
    if (this._isUnmounted) {
      return;
    }
    this.refreshUnsubscribe = undefined;
    this.props.dismissModal();
    this.setState({ taskMonitor: undefined });
    const { name, region, vpcId } = this.state.securityGroup;
    const newStateParams = {
      provider: 'tencentcloud',
      name,
      accountId: this.getAccount(),
      region,
      vpcId,
    };
    if (!ReactInjector.$state.includes('**.firewallDetails')) {
      ReactInjector.$state.go('.firewallDetails', newStateParams);
    } else {
      ReactInjector.$state.go('^.firewallDetails', newStateParams);
    }
  };

  handleSubmit = (values: ISecurityGroupDetail) => {
    const { application, dismissModal } = this.props;
    const { inRules, stack, detail, credentials, name, description, region } = values;
    const taskMonitor = new TaskMonitor({
      application,
      title: `Creating your ${FirewallLabels.get('firewall')}`,
      modalInstance: TaskMonitor.modalInstanceEmulation(() => dismissModal()),
      onTaskComplete: this.onTaskComplete,
    });
    const command = {
      cloudProvider: 'tencentcloud',
      stack,
      detail,
      application: application.name,
      account: credentials,
      accountName: credentials,
      name,
      securityGroupDesc: description,
      region,
      inRules,
    };
    taskMonitor.submit(() => {
      return SecurityGroupWriter.upsertSecurityGroup(command, application, 'Create');
    });
    this.setState({ taskMonitor, securityGroup: values });
  };

  private _isUnmounted = false;

  private refreshUnsubscribe: () => void;

  public componentWillUnmount(): void {
    this._isUnmounted = true;
    if (this.refreshUnsubscribe) {
      this.refreshUnsubscribe();
    }
  }

  private onTaskComplete = (): void => {
    this.props.application.securityGroups.refresh();
    this.refreshUnsubscribe = this.props.application.securityGroups.onNextRefresh(null, this.onApplicationRefresh);
  };

  public render() {
    const { application, isNew, dismissModal } = this.props;
    const { taskMonitor, securityGroup } = this.state;
    return (
      <WizardModal<ISecurityGroupDetail>
        heading={`${isNew ? 'Creating' : 'Updating'} ${FirewallLabels.get('Firewall')}`}
        initialValues={securityGroup}
        taskMonitor={taskMonitor}
        submitButtonLabel={isNew ? 'Create' : 'Update'}
        dismissModal={dismissModal}
        closeModal={this.handleSubmit}
        render={({ formik, nextIdx, wizard }) => {
          return (
            <>
              <WizardPage
                label="Location"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => (
                  <SecurityGroupLocation app={application} formik={formik} isNew={isNew} ref={innerRef} />
                )}
              />
              <WizardPage
                label="Ingress"
                wizard={wizard}
                order={nextIdx()}
                render={({ innerRef }) => <SecurityGroupIngress formik={formik} ref={innerRef} />}
              />
            </>
          );
        }}
      />
    );
  }
}
