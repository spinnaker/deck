import { ProjectAttributes } from 'core/projects/configure/ProjectAttributes';
import { Applications } from 'core/projects/configure/Applications';
import { Pipelines } from 'core/projects/configure/Pipelines';
import * as React from 'react';
import { ProjectReader } from '../service/ProjectReader';
import { ProjectWriter } from '../service/ProjectWriter';
import { ApplicationReader } from 'core/application/service/ApplicationReader';
import { StateService } from '@uirouter/core';

import {
  ReactInjector,
  WizardModal,
  IModalComponentProps,
  noop,
  ReactModal,
  IProject,
  IProjectPipeline,
} from '@spinnaker/core';
import { IApplicationSummary } from 'application';
import { IPipelineTemplateConfig } from 'pipeline/config/templates/PipelineTemplateReader';

import './ConfigureProjectModal.css';

export interface IConfigureProjectModalProps extends IModalComponentProps {
  title: string;
  projectConfiguration: IProject;
  command: {
    viewState: {
      applications: string[];
      pipelineConfigs: { app: string; pipelineConfigId: string }[];
      attributes: { name: string; email: string };
    };
  };
}

export interface IConfigureProjectModalState {
  loaded: boolean;
  existingProjectNames: string[];
  appPipelines: Map<string, string[]>;
  allApplications: IApplicationSummary[];
  selectedApplications: string[];
  selectedPipelines: { app: string; pipelines: string[] }[];
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

    // TODO(archana): Set pipelines for app once you get existing apps
    this.state = {
      loaded: false,
      existingProjectNames: [],
      appPipelines: new Map(),
      allApplications: [],
      selectedApplications: [],
      selectedPipelines: [],
    };
  }

  componentWillMount() {
    this.fetchData();
    this.fetchApplicationsList();
  }

  private submit = (command): void => {
    const { projectConfiguration } = this.props;
    debugger;
    // const project = {
    //   id: projectConfiguration.id,
    //   name: projectConfiguration.name
    // }
  };

  private validate = () => {
    return {};
  };

  private fetchData = async () => {
    let projects = await ProjectReader.listProjects();
    this.setState({
      existingProjectNames: projects.map((project: IProject) => project.name),
      loaded: true,
    });
  };

  private fetchApplicationsList = async () => {
    const applications = await ApplicationReader.listApplications();
    this.setState({
      allApplications: applications,
    });
  };

  private onAppsChange = async (selectedApplications: string[]) => {
    this.setState(
      {
        selectedApplications,
      },
      () => {
        this.fetchPipelinesForApps();
      },
    );
  };

  private fetchPipelinesForApps = async () => {
    const { selectedApplications, appPipelines } = this.state;
    selectedApplications.forEach(async (app: string) => {
      if (!Object.keys(appPipelines).includes(app)) {
        const pipelineConfigs = await ApplicationReader.getPipelineConfigsForApp(app);
        this.setState({
          appPipelines: this.state.appPipelines.set(
            app,
            pipelineConfigs.map((config: IPipelineTemplateConfig) => config.name),
          ),
        });
      }
    });
  };

  private onPipelinesChange = async (selectedPipelines: { app: string; pipelines: string[] }[]) => {
    this.setState({
      selectedPipelines,
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
    const { dismissModal, title, projectConfiguration } = this.props;
    const { allApplications, appPipelines, loaded, taskMonitor } = this.state;

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
        <Applications
          applications={projectConfiguration ? projectConfiguration.config.applications : []}
          onChange={this.onAppsChange}
          allApplications={allApplications.map(app => app.name)}
        />
        <Pipelines appsPipelinesMap={appPipelines} onChange={this.onPipelinesChange} />
      </WizardModal>
    );
  }
}
