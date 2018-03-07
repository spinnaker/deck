import * as React from 'react';
import { get } from 'lodash';

import { NgReact, ReactInjector } from 'core/reactShims';
import { Application } from 'core/application';
import { IServerGroup } from 'core/domain';
import { JenkinsViewModel } from 'core/serverGroup/ServerGroup';
import { EntityNotifications } from 'core/entityTag/notifications/EntityNotifications';
import { HealthCounts } from 'core/healthCounts';
import { CloudProviderLogo } from 'core/cloudProvider';
import { LoadBalancersTagWrapper } from 'core/loadBalancer';
import { ServerGroupManagerTag } from 'core/serverGroupManager/ServerGroupManagerTag';
import { ISortFilter } from 'core/filterModel';
import { Overridable } from 'core/overrideRegistry';

export interface IServerGroupHeaderProps {
  application: Application;
  images?: string;
  isMultiSelected: boolean;
  jenkins: JenkinsViewModel;
  serverGroup: IServerGroup;
  sortFilter: ISortFilter;
}

export class LoadBalancers extends React.Component<IServerGroupHeaderProps> {
  public render() {
    const { application, serverGroup } = this.props;
    const hasLoadBalancer = !!get(serverGroup, 'loadBalancers.length') || !!get(serverGroup, 'targetGroups.length');
    return hasLoadBalancer &&
      <LoadBalancersTagWrapper key="lbwrapper" application={application} serverGroup={serverGroup}/>;
  }
}

export class MultiSelectCheckbox extends React.Component<IServerGroupHeaderProps> {
  public render() {
    // ServerGroup.tsx handles multi-select events and state
    const { isMultiSelected, sortFilter: { multiselect } } = this.props;
    return multiselect && <input type="checkbox" checked={isMultiSelected}/>;
  }
}

export class CloudProviderIcon extends React.Component<IServerGroupHeaderProps> {
  public render() {
    const { serverGroup } = this.props;
    return <CloudProviderLogo provider={serverGroup.type} height="16px" width="16px"/>;
  }
}

export class Sequence extends React.Component<IServerGroupHeaderProps> {
  public render() {
    const { serverGroup } = this.props;
    const serverGroupSequence = ReactInjector.namingService.getSequence(serverGroup.moniker.sequence);
    return <span className="server-group-sequence"> {serverGroupSequence}</span>;
  }
}

export class BuildAndImages extends React.Component<IServerGroupHeaderProps> {
  public render() {
    const { jenkins, images } = this.props;
    return (
      <div>
        {(!!jenkins || !!images) && <span>: </span>}
        {!!jenkins && <a className="build-link" href={jenkins.href} target="_blank">Build: #{jenkins.number}</a>}
        {!!images && <span>{images}</span>}
      </div>
    );
  };
}

export class Alerts extends React.Component<IServerGroupHeaderProps> {
  public render() {
    const { application, serverGroup } = this.props;
    return (
      <EntityNotifications
        application={application}
        entity={serverGroup}
        entityType="serverGroup"
        hOffsetPercent="20%"
        onUpdate={() => application.serverGroups.refresh()}
        pageLocation="pod"
        placement="top"
      />
    );
  };
}

@Overridable('serverGroups.pod.header.health')
export class Health extends React.Component<IServerGroupHeaderProps> {
  public render() {
    const { serverGroup } = this.props;
    return <HealthCounts className="no-float" container={serverGroup.instanceCounts}/>;
  }
}

export class RunningTasks extends React.Component<IServerGroupHeaderProps> {
  public render() {
    const { application, serverGroup } = this.props;
    const { RunningTasksTag } = NgReact;
    const hasRunningExecutions = !!serverGroup.runningExecutions.length || !!serverGroup.runningTasks.length;

    return hasRunningExecutions && (
      <RunningTasksTag
        application={application}
        tasks={serverGroup.runningTasks}
        executions={serverGroup.runningExecutions}
      />
    );
  };
}

export class ServerGroupManager extends React.Component<IServerGroupHeaderProps> {
  public render() {
    const { application, serverGroup } = this.props;
    return <ServerGroupManagerTag application={application} serverGroup={serverGroup}/>;
  }
}

@Overridable('serverGroups.pod.header')
export class ServerGroupHeader extends React.Component<IServerGroupHeaderProps> {
  public render() {
    const props = this.props;

    return (
      <div className={`flex-container-h baseline server-group-title sticky-header-3`}>
        <div className="flex-container-h baseline section-title">
          <MultiSelectCheckbox {...props}/>
          <CloudProviderIcon {...props}/>
          <Sequence {...props}/>
          <BuildAndImages {...props}/>
          <Alerts {...props}/>
        </div>

        <div className="flex-container-h baseline flex-pull-right">
          <RunningTasks {...props}/>
          <LoadBalancers {...props}/>
          <ServerGroupManager {...props}/>
          <Health {...props}/>
        </div>
      </div>
    )
  }
}
