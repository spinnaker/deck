import { ProjectAttributes } from 'core/projects/configure/ProjectAttributes';
import * as React from 'react';
import { get } from 'lodash';
import { FormikErrors, FormikValues } from 'formik';
import { IDeferred } from 'angular';
import { IModalServiceInstance } from 'angular-ui-bootstrap';

import {
  Application,
  IStage,
  ReactInjector,
  TaskMonitor,
  WizardModal,
  FirewallLabels,
  IModalComponentProps,
  noop,
  ReactModal,
  IProject,
  IProjectPipeline,
} from '@spinnaker/core';

export interface IConfigureProjectModalProps extends IModalComponentProps {
  title: string;
  projectConfiguration: IProject;
}

export interface IConfigureProjectModalState {
  firewallsLabel: string;
  loaded: boolean;
  requiresTemplateSelection: boolean;
  taskMonitor: TaskMonitor;
}

export interface IUpsertProjectCommand {
  config: {
    applications: IProject['config']['applications'];
    clusters: IProject['config']['clusters'];
    pipelineConfigs: IProjectPipeline[];
  };
  email: string;
  id: string;
  name: string;
}

export class ConfigureProjectModal extends React.Component<IConfigureProjectModalProps, IConfigureProjectModalState> {
  public static defaultProps: Partial<IConfigureProjectModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  private refreshUnsubscribe: () => void;
  private $uibModalInstanceEmulation: IModalServiceInstance & { deferred?: IDeferred<any> };

  public static show(props: IConfigureProjectModalProps): Promise<any> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(ConfigureProjectModal, props, modalProps);
  }

  constructor(props: IConfigureProjectModalProps) {
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
        modalInstance: this.$uibModalInstanceEmulation,
        onTaskComplete: this.onTaskComplete,
      }),
    };
  }

  private templateSelected = () => {
    this.setState({ requiresTemplateSelection: false });
    this.configureCommand();
  };

  private onTaskComplete() {
    this.props.application.serverGroups.refresh();
    this.props.application.serverGroups.onNextRefresh(null, this.onApplicationRefresh);
  }

  protected onApplicationRefresh(): void {
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
          provider: 'aws',
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
  }

  private initializeCommand = () => {
    const { command } = this.props;
    if (command.viewState.imageId) {
      const foundImage = command.backingData.packageImages.filter(image => {
        return image.amis[command.region] && image.amis[command.region].includes(command.viewState.imageId);
      });
      if (foundImage.length) {
        command.amiName = foundImage[0].imageName;
      }
    }

    command.credentialsChanged(command);
    command.regionChanged(command);
    AwsReactInjector.awsServerGroupConfigurationService.configureSubnetPurposes(command);
  };

  private configureCommand = () => {
    const { application, command } = this.props;
    AwsReactInjector.awsServerGroupConfigurationService.configureCommand(application, command).then(() => {
      if (['clone', 'create'].includes(command.viewState.mode)) {
        if (!command.backingData.packageImages.length) {
          command.viewState.useAllImageSelection = true;
        }
      }

      this.initializeCommand();
      this.setState({ loaded: true, requiresTemplateSelection: false });
    });
  };

  public componentWillUnmount(): void {
    if (this.refreshUnsubscribe) {
      this.refreshUnsubscribe();
    }
  }

  private submit = (command: IAmazonServerGroupCommand): void => {
    const forPipelineConfig = command.viewState.mode === 'editPipeline' || command.viewState.mode === 'createPipeline';
    if (forPipelineConfig) {
      this.props.closeModal && this.props.closeModal(command);
    } else {
      this.state.taskMonitor.submit(() =>
        ReactInjector.serverGroupWriter.cloneServerGroup(command, this.props.application),
      );
    }
  };

  private validate = (_values: FormikValues): FormikErrors<IAmazonServerGroupCommand> => {
    const errors = {} as FormikErrors<IAmazonServerGroupCommand>;
    return errors;
  };

  public render() {
    const { application, command, dismissModal, title } = this.props;
    const { loaded, taskMonitor, requiresTemplateSelection } = this.state;

    return (
      <WizardModal
        heading="Configure Project"
        initialValues={command}
        loading={!loaded}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        closeModal={this.submit}
        submitButtonLabel={command.viewState.submitButtonLabel}
        validate={this.validate}
      >
        <ProjectAttributes />
      </WizardModal>
    );
  }
}
