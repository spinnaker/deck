import * as React from 'react';
import { get } from 'lodash';

import {
  Application,
  FirewallLabels,
  IModalComponentProps,
  IStage,
  ReactInjector,
  ReactModal,
  TaskMonitor,
  WizardModal,
  WizardPage,
  noop,
} from '@spinnaker/core';

import { TencentReactInjector } from '../../../reactShims';

import { ITencentServerGroupCommand } from '../serverGroupConfiguration.service';

import {
  ServerGroupBasicSettings,
  ServerGroupCapacity,
  ServerGroupInstanceType,
  ServerGroupLoadBalancers,
  ServerGroupSecurityGroups,
  ServerGroupAdvancedSettings,
} from './pages';
import { ServerGroupTemplateSelection } from './ServerGroupTemplateSelection';

export interface ITencentCloneServerGroupModalProps extends IModalComponentProps {
  title: string;
  application: Application;
  command: ITencentServerGroupCommand;
}

export interface ITencentCloneServerGroupModalState {
  firewallsLabel: string;
  loaded: boolean;
  requiresTemplateSelection: boolean;
  taskMonitor: TaskMonitor;
}

export class TencentCloneServerGroupModal extends React.Component<
  ITencentCloneServerGroupModalProps,
  ITencentCloneServerGroupModalState
> {
  public static defaultProps: Partial<ITencentCloneServerGroupModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  private _isUnmounted = false;
  private refreshUnsubscribe: () => void;

  public static show(props: ITencentCloneServerGroupModalProps): Promise<ITencentServerGroupCommand> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(TencentCloneServerGroupModal, props, modalProps);
  }

  constructor(props: ITencentCloneServerGroupModalProps) {
    super(props);

    const requiresTemplateSelection = get(props, 'command.viewState.requiresTemplateSelection', false);
    if (!requiresTemplateSelection) {
      this.configureCommand();
    }

    this.state = {
      firewallsLabel: FirewallLabels.get('Firewalls'),
      loaded: false,
      requiresTemplateSelection,
      taskMonitor: new TaskMonitor({
        application: props.application,
        title: 'Creating your server group',
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
        onTaskComplete: this.onTaskComplete,
      }),
    };
  }

  private templateSelected = () => {
    this.setState({ requiresTemplateSelection: false });
    this.configureCommand();
  };

  private onTaskComplete = () => {
    this.props.application.serverGroups.refresh();
    this.props.application.serverGroups.onNextRefresh(null, this.onApplicationRefresh);
  };

  protected onApplicationRefresh = (): void => {
    if (this._isUnmounted) {
      return;
    }

    const { command } = this.props;
    const { taskMonitor } = this.state;
    const cloneStage = taskMonitor.task.execution.stages.find((stage: IStage) => stage.type === 'cloneServerGroup');
    if (cloneStage && cloneStage.context['deploy.server.groups']) {
      const newServerGroupName = cloneStage.context['deploy.server.groups'][command.region];
      if (newServerGroupName) {
        const newStateParams = {
          serverGroup: newServerGroupName,
          accountId: command.credentials,
          region: command.region,
          provider: 'tencent',
        };
        let transitionTo = '^.^.^.clusters.serverGroup';
        if (ReactInjector.$state.includes('**.clusters.serverGroup')) {
          // clone via details, all view
          transitionTo = '^.serverGroup';
        }
        if (ReactInjector.$state.includes('**.clusters.cluster.serverGroup')) {
          // clone or create with details open
          transitionTo = '^.^.serverGroup';
        }
        if (ReactInjector.$state.includes('**.clusters')) {
          // create new, no details open
          transitionTo = '.serverGroup';
        }
        ReactInjector.$state.go(transitionTo, newStateParams);
      }
    }
  };

  private initializeCommand = () => {
    const { command } = this.props;

    command.credentialsChanged(command);
    command.regionChanged(command);
    TencentReactInjector.tencentServerGroupConfigurationService.configureSubnetPurposes(command);
  };

  private configureCommand = () => {
    const { application, command } = this.props;
    TencentReactInjector.tencentServerGroupConfigurationService.configureCommand(application, command).then(() => {
      this.initializeCommand();
      this.setState({ loaded: true, requiresTemplateSelection: false });
    });
  };

  private normalizeCommand = ({ tags }: ITencentServerGroupCommand) => {
    if (!tags) {
      return;
    }
    Object.keys(tags).forEach(key => {
      if (!key.length && !tags[key].length) {
        delete tags[key];
      }
    });
  };

  public componentWillUnmount(): void {
    this._isUnmounted = true;
    if (this.refreshUnsubscribe) {
      this.refreshUnsubscribe();
    }
  }

  private submit = (command: ITencentServerGroupCommand): void => {
    this.normalizeCommand(command);
    const forPipelineConfig = command.viewState.mode === 'editPipeline' || command.viewState.mode === 'createPipeline';
    if (forPipelineConfig) {
      this.props.closeModal && this.props.closeModal(command);
    } else {
      this.state.taskMonitor.submit(() =>
        ReactInjector.serverGroupWriter.cloneServerGroup(command, this.props.application),
      );
    }
  };

  public render() {
    const { application, command, dismissModal, title } = this.props;
    const { loaded, taskMonitor, requiresTemplateSelection } = this.state;

    if (requiresTemplateSelection) {
      return (
        <ServerGroupTemplateSelection
          app={application}
          command={command}
          onDismiss={dismissModal}
          onTemplateSelected={this.templateSelected}
        />
      );
    }

    return (
      <WizardModal<ITencentServerGroupCommand>
        heading={title}
        initialValues={command}
        loading={!loaded}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        closeModal={this.submit}
        submitButtonLabel={command.viewState.submitButtonLabel}
        render={({ formik, nextIdx, wizard }) => (
          <>
            <WizardPage
              label="Basic Settings"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <ServerGroupBasicSettings ref={innerRef} formik={formik} app={application} />}
            />

            <WizardPage
              label="Load Balancers"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <ServerGroupLoadBalancers ref={innerRef} formik={formik} />}
            />

            <WizardPage
              label={FirewallLabels.get('Firewalls')}
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <ServerGroupSecurityGroups ref={innerRef} formik={formik} />}
            />

            <WizardPage
              label="Instance Type"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <ServerGroupInstanceType ref={innerRef} formik={formik} />}
            />

            <WizardPage
              label="Capacity"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => <ServerGroupCapacity ref={innerRef} formik={formik} />}
            />

            <WizardPage
              label="Advanced Settings"
              wizard={wizard}
              order={nextIdx()}
              render={({ innerRef }) => (
                <ServerGroupAdvancedSettings ref={innerRef} formik={formik} app={application} />
              )}
            />
          </>
        )}
      />
    );
  }
}
