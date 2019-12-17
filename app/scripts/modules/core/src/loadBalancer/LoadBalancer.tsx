import React from 'react';
import { UISref, UISrefActive } from '@uirouter/react';
import classNames from 'classnames';

import { Application } from 'core/application/application.model';
import { CloudProviderRegistry } from 'core/cloudProvider';
import { ILoadBalancer, IServerGroup, ILoadBalancerGroup } from 'core/domain';
import { ManagedResourceStatusIndicator } from 'core/managed';

import { HealthCounts } from 'core/healthCounts/HealthCounts';
import { LoadBalancerClusterContainer } from './LoadBalancerClusterContainer';
import { EntityNotifications } from 'core/entityTag/notifications/EntityNotifications';

export interface ILoadBalancerProps {
  application: Application;
  grouping: ILoadBalancerGroup;
  loadBalancer: ILoadBalancer;
  serverGroups: IServerGroup[];
  showServerGroups?: boolean;
  showInstances?: boolean;
}

export class LoadBalancer extends React.Component<ILoadBalancerProps> {
  public static defaultProps: Partial<ILoadBalancerProps> = {
    showServerGroups: true,
    showInstances: false,
  };

  public render(): React.ReactElement<LoadBalancer> {
    const { application, grouping, loadBalancer, serverGroups, showInstances, showServerGroups } = this.props;
    const config = CloudProviderRegistry.getValue(loadBalancer.provider || loadBalancer.cloudProvider, 'loadBalancer');
    const ClusterContainer = config.ClusterContainer || LoadBalancerClusterContainer;
    const showManagedIndicator = !grouping.isManaged && loadBalancer.isManaged;

    const params = {
      application: application.name,
      region: loadBalancer.region,
      accountId: loadBalancer.account,
      name: loadBalancer.name,
      vpcId: loadBalancer.vpcId,
      provider: loadBalancer.cloudProvider,
    };

    return (
      <div className="pod-subgroup load-balancer">
        <div className="load-balancer-header sticky-header-2">
          <UISrefActive class="active">
            <UISref to=".loadBalancerDetails" params={params}>
              <h6 className="clickable clickable-row horizontal middle">
                <i className="fa icon-sitemap" />
                &nbsp; {(loadBalancer.region || '').toUpperCase()}
                <div
                  className={classNames('flex-container-h middle flex-1', {
                    'sp-margin-s-left': showManagedIndicator,
                  })}
                >
                  {showManagedIndicator && (
                    <ManagedResourceStatusIndicator
                      shape="circle"
                      resourceSummary={loadBalancer.managedResourceSummary}
                    />
                  )}
                  <EntityNotifications
                    entity={loadBalancer}
                    application={application}
                    placement="bottom"
                    entityType="loadBalancer"
                    pageLocation="pod"
                    onUpdate={() => application.loadBalancers.refresh()}
                  />
                </div>
                <HealthCounts container={loadBalancer.instanceCounts} />
              </h6>
            </UISref>
          </UISrefActive>
        </div>
        <ClusterContainer
          loadBalancer={loadBalancer}
          serverGroups={serverGroups}
          showServerGroups={showServerGroups}
          showInstances={showInstances}
        />
      </div>
    );
  }
}
