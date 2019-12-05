import * as React from 'react';
import { isEqual } from 'lodash';

import { ILoadBalancerClusterContainerProps } from '@spinnaker/core';

import { ITencentApplicationLoadBalancer } from '../domain/ITencentLoadBalancer';
import { TargetGroup } from './TargetGroup';

export class TencentLoadBalancerClusterContainer extends React.Component<ILoadBalancerClusterContainerProps> {
  public shouldComponentUpdate(nextProps: ILoadBalancerClusterContainerProps) {
    const serverGroupsDiffer = () =>
      !isEqual((nextProps.serverGroups || []).map(g => g.name), (this.props.serverGroups || []).map(g => g.name));
    const targetGroupsDiffer = () =>
      !isEqual(
        ((nextProps.loadBalancer as ITencentApplicationLoadBalancer).targetGroups || []).map(t => t.name),
        ((this.props.loadBalancer as ITencentApplicationLoadBalancer).targetGroups || []).map(t => t.name),
      );
    return (
      nextProps.showInstances !== this.props.showInstances ||
      nextProps.showServerGroups !== this.props.showServerGroups ||
      nextProps.loadBalancer !== this.props.loadBalancer ||
      serverGroupsDiffer() ||
      targetGroupsDiffer()
    );
  }

  public render(): React.ReactElement<TencentLoadBalancerClusterContainer> {
    const { loadBalancer, showInstances, showServerGroups } = this.props;
    const alb = loadBalancer as ITencentApplicationLoadBalancer;
    const ServerGroups = alb.serverGroups
      ? alb.serverGroups.map(serverGroup => {
          return (
            <TargetGroup
              key={serverGroup.name}
              loadBalancer={loadBalancer as ITencentApplicationLoadBalancer}
              serverGroup={serverGroup}
              showInstances={showInstances}
              showServerGroups={showServerGroups}
            />
          );
        })
      : [];
    return <div className="cluster-container">{ServerGroups}</div>;
  }
}
