import React from 'react';
import { IScope } from 'angular';
import { Button } from 'react-bootstrap';
import { StateService } from '@uirouter/core';
import { IModalService } from 'angular-ui-bootstrap';

import { Application } from 'core/application';
import { ConfigureProjectModal } from 'core/projects';
import { ModalInjector, ReactInjector } from 'core/reactShims';
import { OverrideRegistry } from 'core/overrideRegistry';
import { CacheInitializerService } from 'core/cache';

export interface IInsightMenuProps {
  createApp?: boolean;
  createProject?: boolean;
  refreshCaches?: boolean;
}

export interface IInsightMenuState {
  refreshingCache: boolean;
}

export class InsightMenu extends React.Component<IInsightMenuProps, IInsightMenuState> {
  public static defaultProps: IInsightMenuProps = { createApp: true, createProject: true, refreshCaches: true };

  private $rootScope: IScope;
  private $uibModal: IModalService;
  private $state: StateService;
  private overrideRegistry: OverrideRegistry;
  private cacheInitializer: CacheInitializerService;

  constructor(props: IInsightMenuProps) {
    super(props);
    this.state = {} as IInsightMenuState;
    this.$state = ReactInjector.$state;
    this.$uibModal = ModalInjector.modalService;
    this.$rootScope = ReactInjector.$rootScope;
    this.overrideRegistry = ReactInjector.overrideRegistry;
    this.cacheInitializer = ReactInjector.cacheInitializer;
  }

  private createProject = () =>
    ConfigureProjectModal.show()
      .then(result => {
        this.$state.go('home.project.dashboard', { project: result.name });
      })
      .catch(() => {});

  private createApplication = () => {
    this.$uibModal
      .open({
        scope: this.$rootScope.$new(),
        templateUrl: this.overrideRegistry.getTemplate(
          'createApplicationModal',
          require('../application/modal/newapplication.html'),
        ),
        controller: this.overrideRegistry.getController('CreateApplicationModalCtrl'),
        controllerAs: 'newAppModal',
      })
      .result.then(this.routeToApplication)
      .catch(() => {});
  };

  private routeToApplication = (app: Application) => {
    this.$state.go('home.applications.application.insight.clusters', { application: app.name });
  };

  private refreshAllCaches = () => {
    if (this.state.refreshingCache) {
      return;
    }

    this.setState({ refreshingCache: true });
    this.cacheInitializer.refreshCaches().then(() => {
      this.setState({ refreshingCache: false });
    });
  };

  public render() {
    const { createApp, createProject, refreshCaches } = this.props;
    const refreshMarkup = this.state.refreshingCache ? (
      <span>
        <span className="fa fa-sync-alt fa-spin" /> Refreshing...
      </span>
    ) : (
      <span>Refresh all caches</span>
    );

    return (
      <div id="insight-menu">
        {createProject && (
          <Button
            bsStyle={createApp ? 'default' : 'primary'}
            href="javascript:void(0)"
            onClick={this.createProject}
            style={{ marginRight: createApp ? '5px' : '' }}
          >
            Create Project
          </Button>
        )}

        {createApp && (
          <Button
            bsStyle="primary"
            href="javascript:void(0)"
            onClick={this.createApplication}
            style={{ marginRight: refreshCaches ? '5px' : '' }}
          >
            Create Application
          </Button>
        )}

        {refreshCaches && (
          <Button href="javascript:void(0)" onClick={this.refreshAllCaches}>
            {refreshMarkup}
          </Button>
        )}
      </div>
    );
  }
}
