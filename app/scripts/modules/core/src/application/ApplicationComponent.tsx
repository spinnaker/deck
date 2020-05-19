import { ApplicationNavigation } from './nav/ApplicationNavigation';
import React from 'react';
import { UIView } from '@uirouter/react';

import { Application } from './application.model';
import { RecentHistoryService } from 'core/history';
import { DebugWindow } from 'core/utils/consoleDebug';
import { CollapsibleSectionStateCache } from 'core/cache';
import { SchedulerFactory, IScheduler } from 'core/scheduler';

import './application.less';

export interface IApplicationComponentProps {
  app: Application;
}

export interface IApplicationComponentState {
  showVerticalNav: boolean;
}

export class ApplicationComponent extends React.Component<IApplicationComponentProps, IApplicationComponentState> {
  private cacheRefresh: IScheduler;

  constructor(props: IApplicationComponentProps) {
    super(props);
    this.mountApplication(props.app);
    this.state = {
      showVerticalNav:
        !CollapsibleSectionStateCache.isSet('verticalNav') || CollapsibleSectionStateCache.isExpanded('verticalNav'),
    };
  }

  public componentDidMount(): void {
    this.cacheRefresh = SchedulerFactory.createScheduler(500);
    this.cacheRefresh.subscribe(() => {
      if (CollapsibleSectionStateCache.isExpanded('verticalNav') !== this.state.showVerticalNav) {
        this.setState({
          showVerticalNav:
            !CollapsibleSectionStateCache.isSet('verticalNav') ||
            CollapsibleSectionStateCache.isExpanded('verticalNav'),
        });
      }
    });
  }

  public componentWillUnmount(): void {
    this.unmountApplication(this.props.app);
  }

  public componentWillReceiveProps(nextProps: IApplicationComponentProps): void {
    this.unmountApplication(this.props.app);
    this.mountApplication(nextProps.app);
  }

  private mountApplication(app: Application) {
    if (app.notFound || app.hasError) {
      RecentHistoryService.removeLastItem('applications');
      return;
    }

    DebugWindow.application = app;
    // KLUDGE: warning, do not use, this is temporarily and will be removed very soon.
    !app.attributes?.disableAutoRefresh && app.enableAutoRefresh();
  }

  private unmountApplication(app: Application) {
    if (app.notFound || app.hasError) {
      return;
    }
    DebugWindow.application = undefined;
    app.disableAutoRefresh();
    this.cacheRefresh.unsubscribe();
  }

  public render() {
    const { app } = this.props;
    const { showVerticalNav } = this.state;

    return (
      <div className="application">
        {!app.notFound && !app.hasError && showVerticalNav && <ApplicationNavigation app={app} />}
        {app.notFound && (
          <div>
            <h2 className="text-center">Application Not Found</h2>
            <p className="text-center" style={{ marginBottom: '20px' }}>
              Please check your URL - we can't find any data for <em>{app.name}</em>.
            </p>
          </div>
        )}
        {app.hasError && (
          <div>
            <h2 className="text-center">Something went wrong</h2>
            <p className="text-center" style={{ marginBottom: '20px' }}>
              There was a problem loading <em>{app.name}</em>. Try checking your browser console for errors.
            </p>
          </div>
        )}
        <div className="container scrollable-columns">
          <UIView className="secondary-panel" name="insight" />
        </div>
      </div>
    );
  }
}
