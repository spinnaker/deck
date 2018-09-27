import { ProjectAttributes } from 'core/projects/configure/ProjectAttributes';
import { Applications } from 'core/projects/configure/Applications';
import { Pipelines } from 'core/projects/configure/Pipelines';
import { Clusters } from 'core/projects/configure/Clusters';
import * as React from 'react';
import { ProjectReader } from '../service/ProjectReader';
import { ProjectWriter } from '../service/ProjectWriter';
import { ApplicationReader } from 'core/application/service/ApplicationReader';

import { WizardModal } from 'core/modal';
import { IModalComponentProps, ReactModal } from 'core/presentation';
import { noop } from 'core/utils';
import { IProject, IProjectPipeline, IProjectCluster } from 'core/domain';
import { TaskMonitor } from 'core/task';
import { IApplicationSummary } from 'core/application';
import { IPipelineTemplateConfig } from 'core/pipeline/config/templates/PipelineTemplateReader';

import './ConfigureProjectModal.css';

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
  appPipelines: Map<string, Array<{ name: string; id: string }>>;
  allApplications: IApplicationSummary[];
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

  public static show(props: IConfigureProjectModalProps): Promise<any> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(ConfigureProjectModal, props, modalProps);
  }

  constructor(props: IConfigureProjectModalProps) {
    super(props);

    this.state = {
      loaded: false,
      existingProjectNames: [],
      appPipelines: new Map(),
      allApplications: [],
      taskMonitor: new TaskMonitor({
        title: 'Updating Project',
        onTaskComplete: this.onTaskComplete,
        modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
      }),
    };
  }

  public componentDidMount() {
    const { projectConfiguration } = this.props;
    const applications = projectConfiguration && projectConfiguration.config.applications;
    if (applications.length) {
      this.fetchPipelinesForApps(applications);
    }
    this.fetchProjects();
    this.fetchApplicationsList();
  }

  private onTaskComplete = () => {};

  private submit = async (values: any) => {
    const { projectConfiguration } = this.props;
    const { applications, pipelineConfigs, clusters, name, email } = values;
    const config = {
      applications,
      pipelineConfigs,
      clusters,
    };

    const project = {
      name,
      id: projectConfiguration.id || null,
      email,
      config,
      notFound: false,
    };

    this.state.taskMonitor.submit(() => ProjectWriter.upsertProject(project));
  };

  public validate = (): { [key: string]: string } => {
    return {};
  };

  private fetchProjects = async () => {
    const projects = await ProjectReader.listProjects();
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

  private onDelete = async () => {
    const { projectConfiguration } = this.props;
    if (projectConfiguration) {
      this.state.taskMonitor.submit(() => ProjectWriter.deleteProject(projectConfiguration));
    }
  };

  public render() {
    const { dismissModal, projectConfiguration } = this.props;
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
          done={!!(projectConfiguration.name && projectConfiguration.email)}
        />

        <Applications
          applications={projectConfiguration ? projectConfiguration.config.applications : []}
          allApplications={allApplications.map(app => app.name)}
          onChange={this.fetchPipelinesForApps}
          done={!!(projectConfiguration && projectConfiguration.config.applications.length)}
        />

        <Clusters
          entries={projectConfiguration ? projectConfiguration.config.clusters : []}
          applications={Array.from(appPipelines.keys())}
          done={!!(projectConfiguration && projectConfiguration.config.clusters.length)}
        />

        <Pipelines
          appsPipelinesMap={appPipelines}
          entries={projectConfiguration ? projectConfiguration.config.pipelineConfigs : []}
          done={!!(projectConfiguration && projectConfiguration.config.pipelineConfigs.length)}
        />
      </WizardModal>
    );
  }
}
