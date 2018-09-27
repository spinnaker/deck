import { ProjectAttributes } from 'core/projects/configure/ProjectAttributes';
import { Applications } from 'core/projects/configure/Applications';
import { Pipelines } from 'core/projects/configure/Pipelines';
import { Clusters } from 'core/projects/configure/Clusters';
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
  IProjectCluster,
} from '@spinnaker/core';
import { IApplicationSummary } from 'application';
import { IPipelineTemplateConfig } from 'pipeline/config/templates/PipelineTemplateReader';

import './ConfigureProjectModal.css';
import { STAGE_FAILURE_MESSAGE_COMPONENT } from 'pipeline/details/stageFailureMessage.component';

export interface IConfigureProjectModalProps extends IModalComponentProps {
  title: string;
  projectConfiguration: IProject;
  command: {
    viewState: {
      applications: string[];
      pipelineConfigs: IProjectPipeline[];
      clusters: IProjectCluster[];
      attributes: { name: string; email: string };
    };
  };
}

export interface IConfigureProjectModalState {
  loaded: boolean;
  existingProjectNames: string[];
  appPipelines: Map<string, { name: string; id: string }[]>;
  allApplications: IApplicationSummary[];
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
      appPipelines: new Map(),
      allApplications: [],
    };
  }

  componentDidMount() {
    const { projectConfiguration } = this.props;
    const applications = projectConfiguration && projectConfiguration.config.applications;
    if (applications.length) {
      this.fetchPipelinesForApps(applications);
    }
    this.fetchProjects();
    this.fetchApplicationsList();
  }

  private submit = async (values: any) => {
    debugger;
    // const { projectConfiguration } = this.props;
    // const { applications, pipelineConfigs, clusters, name, email } = values;
    // const config = {
    //   applications,
    //   pipelineConfigs,
    //   clusters
    // }

    // const project = {
    //   name,
    //   id: projectConfiguration.id || null,
    //   email,
    //   config,
    //   notFound: false
    // }
    // const result = await ProjectWriter.upsertProject(project);
  };

  private validate = () => {
    return {};
  };

  private fetchProjects = async () => {
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

  private fetchPipelinesForApps = async (applications: string[]) => {
    const { appPipelines } = this.state;
    applications.forEach(async (app: string) => {
      if (!Object.keys(appPipelines).includes(app)) {
        const pipelineConfigs = await ApplicationReader.getPipelineConfigsForApp(app);
        this.setState({
          appPipelines: this.state.appPipelines.set(
            app,
            pipelineConfigs.map((config: IPipelineTemplateConfig) => ({ name: config.name, id: config.id })),
          ),
        });
      }
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

    const initialValues =
      (projectConfiguration && {
        name: projectConfiguration.name,
        email: projectConfiguration.email,
        applications: projectConfiguration.config.applications,
        pipelineConfigs: projectConfiguration.config.pipelineConfigs,
        clusters: projectConfiguration.config.clusters,
      }) ||
      {};

    return (
      <WizardModal
        heading="Configure Project"
        initialValues={initialValues}
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
          isNewProject={!projectConfiguration.id}
        />

        <Applications
          applications={projectConfiguration ? projectConfiguration.config.applications : []}
          allApplications={allApplications.map(app => app.name)}
          onChange={this.fetchPipelinesForApps}
        />

        <Clusters
          entries={projectConfiguration ? projectConfiguration.config.clusters : []}
          applications={Array.from(appPipelines.keys())}
        />

        <Pipelines
          appsPipelinesMap={appPipelines}
          entries={projectConfiguration ? projectConfiguration.config.pipelineConfigs : []}
        />
      </WizardModal>
    );
  }
}
