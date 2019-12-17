import React from 'react';

import { AccountTag } from 'core/account';
import { Application } from 'core/application/application.model';
import { ILoadBalancerGroup } from 'core/domain';
import { ManagedResourceStatusIndicator } from 'core/managed';

import { LoadBalancer } from './LoadBalancer';

import './loadBalancerPod.less';

export interface ILoadBalancerPodProps {
  grouping: ILoadBalancerGroup;
  application: Application;
  parentHeading: string;
  showServerGroups: boolean;
  showInstances: boolean;
}

export class LoadBalancerPod extends React.Component<ILoadBalancerPodProps> {
  public render(): React.ReactElement<LoadBalancerPod> {
    const { grouping, application, parentHeading, showServerGroups, showInstances } = this.props;
    const subgroups = grouping.subgroups.map(subgroup => (
      <LoadBalancer
        key={subgroup.heading}
        application={application}
        grouping={grouping}
        loadBalancer={subgroup.loadBalancer}
        serverGroups={subgroup.serverGroups}
        showServerGroups={showServerGroups}
        showInstances={showInstances}
      />
    ));

    return (
      <div className="load-balancer-pod row rollup-entry sub-group">
        <div className="rollup-summary sticky-header">
          <div className="rollup-title-cell">
            <div className="heading-tag">
              <AccountTag account={parentHeading} />
            </div>
            <div className="pod-center horizontal space-between flex-1 no-right-padding">
              <div>{grouping.heading}</div>
              {grouping.isManaged && (
                <ManagedResourceStatusIndicator shape="square" resourceSummary={grouping.managedResourceSummary} />
              )}
            </div>
          </div>
        </div>
        <div className="rollup-details">{subgroups}</div>
      </div>
    );
  }
}
