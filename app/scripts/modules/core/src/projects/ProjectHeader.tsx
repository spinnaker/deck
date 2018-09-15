import { Transition } from '@uirouter/core';
import { UISref, UIView } from '@uirouter/react';
import '@uirouter/rx';
import { IModalService } from 'angular-ui-bootstrap';
import { ReactInjector } from 'core';
import { IProject } from 'core/domain';

import { SpanDropdownTrigger } from 'core/presentation';
import { ConfigureProjectModal } from 'core/projects/configure/ConfigureProjectModal';
import * as React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Subject } from 'rxjs';
import { $injector } from 'ngimport';

export interface IProjectHeaderProps {
  projectConfiguration: IProject;
  transition: Transition;
}

export interface IProjectHeaderState {
  state: string;
  application?: string;
  isOpen: boolean;
}

export class ProjectHeader extends React.Component<IProjectHeaderProps, IProjectHeaderState> {
  public state: IProjectHeaderState = { state: null, application: null, isOpen: false };
  private destroy$ = new Subject();

  public componentDidMount() {
    this.props.transition.router.globals.success$.takeUntil(this.destroy$).subscribe(success => {
      const state = success.to().name;
      const application = success.params().application;
      this.setState({ state, application });
    });
  }

  public componentWillUnmount() {
    this.destroy$.next();
  }

  private handleDropdownToggle = (isOpen: boolean) => this.setState({ isOpen });

  private configureProjectNg = () => {
    const { projectConfiguration } = this.props;
    const $state = ReactInjector.$state;
    const $uibModal: IModalService = $injector.get('$uibModal');

    $uibModal
      .open({
        templateUrl: require('./configure/configureProject.modal.html'),
        controller: 'ConfigureProjectModalCtrl',
        controllerAs: 'ctrl',
        size: 'lg',
        resolve: {
          projectConfig: () => projectConfiguration,
        },
      })
      .result.then(result => {
        if (result.action === 'delete') {
          $state.go('home.infrastructure');
        } else if (result.action === 'upsert') {
          $state.go($state.current, { project: result.name }, { location: 'replace', reload: true });
        }
      })
      .catch(() => {});
  };

  private configureProject = () => {
    const { projectConfiguration } = this.props;
    const { $state } = ReactInjector;
    const title = 'Configure project';

    ConfigureProjectModal.show({ title, projectConfiguration }).then(result => {
      if (result.action === 'delete') {
        $state.go('home.infrastructure');
      } else if (result.action === 'upsert') {
        $state.go($state.current, { project: result.name }, { location: 'replace', reload: true });
      }
    });
  };

  public render() {
    const { projectConfiguration: project } = this.props;
    const { application, state } = this.state;
    const config = project.config;

    const isDashboard = state === 'home.project.dashboard';
    const title = isDashboard ? 'Project Dashboard' : application;

    if (project.notFound) {
      return (
        <div className="project-header">
          <div className="row" ng-if="vm.project.notFound">
            <h1 className="text-center">&lt;404&gt;</h1>

            <p className="text-center">
              Please check your URL - we can't find any data for the project <em>{project.name}</em>.
            </p>
          </div>
        </div>
      );
    }

    const chevronStyle = {
      transition: 'transform 0.15s ease',
      transform: `rotate(${this.state.isOpen ? 180 : 0}deg)`,
    };

    // heh.
    const closeDropdown = () => document.body.click();

    const projectConfiguration = (
      <div className="pull-right" ng-if="vm.viewState.dashboard">
        <button className="passive medium btn-configure configure-project-link" onClick={this.configureProjectNg}>
          <span className="glyphicon glyphicon-cog" /> Project Configuration (ng)
        </button>
        <button className="passive medium btn-configure configure-project-link" onClick={this.configureProject}>
          <span className="glyphicon glyphicon-cog" /> Project Configuration
        </button>
      </div>
    );

    return (
      <div style={{ width: '100%' }}>
        <div className="project-header">
          <div className="container">
            <h2>
              <span className="project-name">{project.name} / </span>
              <div className="project-view">
                <Dropdown id="project" pullRight={true} componentClass={'div'} onToggle={this.handleDropdownToggle}>
                  <SpanDropdownTrigger bsRole="toggle" className="clickable">
                    {title} <span className="small glyphicon glyphicon-chevron-down" style={chevronStyle} />
                  </SpanDropdownTrigger>
                  <Dropdown.Menu>
                    <UISref to=".dashboard">
                      <MenuItem onClick={closeDropdown}>Project Dashboard</MenuItem>
                    </UISref>
                    <MenuItem divider={true} />
                    {config.applications &&
                      config.applications.map(application => (
                        <UISref key={application} to=".application" params={{ application }}>
                          <MenuItem onClick={closeDropdown}> {application} </MenuItem>
                        </UISref>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </h2>

            {isDashboard && projectConfiguration}
          </div>
        </div>

        <UIView name="detail" className="project-details flex-fill" />
      </div>
    );
  }
}
