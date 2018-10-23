import * as React from 'react';
import { FormikErrors } from 'formik';

import { AccountService, IAccount } from 'core/account';
import { ApplicationReader, IApplicationSummary } from 'core/application';
import { IPipeline, IProject } from 'core/domain';
import { WizardModal } from 'core/modal';
import { PipelineConfigService } from 'core/pipeline';
import { IModalComponentProps, ReactModal } from 'core/presentation';
import { Applications, Clusters, Pipelines, ProjectAttributes } from 'core/projects';
import { TaskMonitor } from 'core/task';
import { noop } from 'core/utils';

import { ProjectReader } from '../service/ProjectReader';
import { ProjectWriter } from '../service/ProjectWriter';

import './ConfigureProjectModal.css';

export interface IConfigureProjectModalProps extends IModalComponentProps {
  title: string;
  projectConfiguration: IProject;
}

export interface IConfigureProjectModalState {
  allAccounts: IAccount[];
  allProjects: IProject[];
  allApplications: IApplicationSummary[];
  appPipelines: {
    [appName: string]: IPipeline[];
  };
  configuredApps: string[];
  loading: boolean;
  taskMonitor: TaskMonitor;
}

export class ConfigureProjectModal extends React.Component<IConfigureProjectModalProps, IConfigureProjectModalState> {
  public static defaultProps: Partial<IConfigureProjectModalProps> = {
    closeModal: noop,
    dismissModal: noop,
  };

  public state: IConfigureProjectModalState = {
    loading: true,
    allAccounts: [],
    allProjects: [],
    allApplications: [],
    appPipelines: {},
    configuredApps: [],
    taskMonitor: new TaskMonitor({
      title: 'Updating Project',
      onTaskComplete: () => null,
      modalInstance: TaskMonitor.modalInstanceEmulation(() => this.props.dismissModal()),
    }),
  };

  public static show(props: IConfigureProjectModalProps): Promise<any> {
    const modalProps = { dialogClassName: 'wizard-modal modal-lg' };
    return ReactModal.show(ConfigureProjectModal, props, modalProps);
  }

  private handleApplicationsChanged = (configuredApps: string[]) => {
    this.setState({ configuredApps });
    this.fetchPipelinesForApps(configuredApps);
  };

  public componentDidMount() {
    const applications = (this.props.projectConfiguration && this.props.projectConfiguration.config.applications) || [];
    Promise.all([this.fetchPipelinesForApps(applications), this.initialFetch()]).then(() =>
      this.setState({ loading: false }),
    );
  }

  private submit = (project: IProject) => {
    this.state.taskMonitor.submit(() => ProjectWriter.upsertProject(project));
  };

  public validate = (): FormikErrors<IProject> => {
    return {};
  };

  private initialFetch(): Promise<any> {
    const fetchAccounts = AccountService.listAccounts();
    const fetchApps = ApplicationReader.listApplications();
    const fetchProjects = ProjectReader.listProjects();
    const currentProject = this.props.projectConfiguration.name;
    return Promise.all([fetchAccounts, fetchApps, fetchProjects]).then(
      ([allAccounts, allApplications, allProjects]) => {
        allProjects = allProjects.filter(project => project.name !== currentProject);
        this.setState({ allAccounts, allApplications, allProjects });
      },
    );
  }

  private fetchPipelinesForApps = (applications: string[]) => {
    // Only fetch for apps we don't already have results for
    const appsToFetch = applications.filter(appName => !this.state.appPipelines[appName]);

    const fetches = appsToFetch.map(appName => {
      return PipelineConfigService.getPipelinesForApplication(appName).then(pipelines =>
        this.setState({
          appPipelines: { ...this.state.appPipelines, [appName]: pipelines },
        }),
      );
    });

    return Promise.all(fetches);
  };

  private onDelete = () => {
    const { projectConfiguration } = this.props;
    if (projectConfiguration) {
      this.state.taskMonitor.submit(() => ProjectWriter.deleteProject(projectConfiguration));
    }
  };

  public render() {
    const { dismissModal, projectConfiguration } = this.props;
    const { allAccounts, allApplications, appPipelines, loading, taskMonitor } = this.state;

    return (
      <WizardModal<IProject>
        heading="Configure Project"
        initialValues={projectConfiguration}
        loading={loading}
        taskMonitor={taskMonitor}
        dismissModal={dismissModal}
        closeModal={this.submit}
        submitButtonLabel="Save"
        validate={this.validate}
      >
        <ProjectAttributes allProjects={this.state.allProjects} onDelete={this.onDelete} done={true} />

        <Applications
          allApplications={allApplications.map(app => app.name)}
          onApplicationsChanged={this.handleApplicationsChanged}
          done={!!this.state.configuredApps.length}
        />

        <Clusters accounts={allAccounts} done={true} />

        <Pipelines
          appsPipelines={appPipelines}
          entries={projectConfiguration ? projectConfiguration.config.pipelineConfigs : []}
          done={!!(projectConfiguration && projectConfiguration.config.pipelineConfigs.length)}
        />
      </WizardModal>
    );
  }
}
