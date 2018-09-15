import { ProjectAttributes } from 'core/projects/configure/ProjectAttributes';
import { Applications } from 'core/projects/configure/Applications';
import * as React from 'react';
import { ProjectReader } from '../service/ProjectReader';
import { ProjectWriter } from '../service/ProjectWriter';
import { StateService } from '@uirouter/core';

import {
  Application,
  ReactInjector,
  TaskMonitor,
  WizardModal,
  IModalComponentProps,
  noop,
  ReactModal,
  IProject,
  IProjectPipeline,
} from '@spinnaker/core';

export interface IConfigureProjectModalProps extends IModalComponentProps {
  title: string;
  projectConfiguration: IProject;
  command: any;
}

export interface IConfigureProjectModalState {
  loaded: boolean;
  existingProjectNames: string[];
  // taskMonitor: TaskMonitor;
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
  private $state: StateService;

  public static defaultProps: Partial<IConfigureProjectModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public static show(props: IConfigureProjectModalProps): Promise<any> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(ConfigureProjectModal, props, modalProps);
  }

  constructor(props: IConfigureProjectModalProps) {
    super(props);
    this.$state = ReactInjector.$state;

    this.state = {
      loaded: false,
      existingProjectNames: [],
    };
  }

  componentWillMount() {
    this.fetchData();
  }

  private submit = (command: IAmazonServerGroupCommand): void => {
    // const forPipelineConfig = command.viewState.mode === 'editPipeline' || command.viewState.mode === 'createPipeline';
    // if (forPipelineConfig) {
    //   this.props.closeModal && this.props.closeModal(command);
    // } else {
    //   this.state.taskMonitor.submit(() =>
    //     ReactInjector.serverGroupWriter.cloneServerGroup(command, this.props.application),
    //   );
    // }
  };

  private validate = () => {};

  private fetchData = async () => {
    let projects = await ProjectReader.listProjects();
    this.setState({
      existingProjectNames: projects.map((project: IProject) => project.name),
      loaded: true,
    });
  };

  private initializeCommand = () => {};

  private onDelete = async () => {
    const { projectConfiguration } = this.props;
    if (projectConfiguration) {
      const deletionStatus = await ProjectWriter.deleteProject(projectConfiguration);
      this.$state.go('home.search');
    }
  };

  public render() {
    const { application, dismissModal, title, projectConfiguration } = this.props;
    const { loaded, taskMonitor } = this.state;

    return (
      <WizardModal
        heading="Configure Project"
        initialValues={{}}
        loading={!loaded}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        closeModal={this.submit}
        submitButtonLabel="Save"
        validate={this.validate}
      >
        <ProjectAttributes
          onDelete={this.onDelete}
          existingProjectNames={this.state.existingProjectNames}
          configuration={{
            name: projectConfiguration && projectConfiguration.name,
            email: projectConfiguration && projectConfiguration.email,
          }}
        />
        <Applications />
      </WizardModal>
    );
  }
}
