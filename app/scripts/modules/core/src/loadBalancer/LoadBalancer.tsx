import * as React from 'react';
import autoBindMethods from 'class-autobind-decorator';
import { UISref, UISrefActive } from '@uirouter/react';

import { Application } from 'core/application/application.model';
import { ILoadBalancer, IServerGroup } from 'core/domain';
import { ReactInjector } from 'core/reactShims';

import { HealthCounts } from 'core/healthCounts/HealthCounts';
import { LoadBalancerClusterContainer } from './LoadBalancerClusterContainer';
import { EntityNotifications } from 'core/entityTag/notifications/EntityNotifications';

export interface ILoadBalancerProps {
  application: Application;
  loadBalancer: ILoadBalancer;
  serverGroups: IServerGroup[];
  showServerGroups?: boolean;
  showInstances?: boolean;
}

@autoBindMethods
export class LoadBalancer extends React.Component<ILoadBalancerProps> {
  public static defaultProps: Partial<ILoadBalancerProps> = {
    showServerGroups: true,
    showInstances : false
  };

  public render(): React.ReactElement<LoadBalancer> {
    const { application, loadBalancer, serverGroups, showInstances, showServerGroups } = this.props;
    const { cloudProviderRegistry } = ReactInjector;
    const config = cloudProviderRegistry.getValue(loadBalancer.provider || loadBalancer.cloudProvider, 'loadBalancer');
    const ClusterContainer = config.ClusterContainer || LoadBalancerClusterContainer;

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
              <h6 className="clickable clickable-row">
                <span className="icon icon-elb"/> {(loadBalancer.region || '').toUpperCase()}
                <EntityNotifications
                  entity={loadBalancer}
                  application={application}
                  placement="bottom"
                  entityType="loadBalancer"
                  pageLocation="pod"
                  onUpdate={application.loadBalancers.refresh}
                />
                <span className="text-right">
                  <HealthCounts container={loadBalancer.instanceCounts}/>
                </span>
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
