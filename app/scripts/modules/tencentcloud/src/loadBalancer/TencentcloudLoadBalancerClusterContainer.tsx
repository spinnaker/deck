import * as React from 'react';
import { isEqual } from 'lodash';

import { ILoadBalancerClusterContainerProps } from '@spinnaker/core';

import { ITencentcloudApplicationLoadBalancer } from '../domain/ITencentcloudLoadBalancer';
import { TargetGroup } from './TargetGroup';

function TencentcloudLoadBalancerClusterContainerCom(props: ILoadBalancerClusterContainerProps) {
  const { loadBalancer, showInstances, showServerGroups } = props;
  const alb = loadBalancer as ITencentcloudApplicationLoadBalancer;
  const ServerGroups = alb.serverGroups
    ? alb.serverGroups.map(item => {
        return (
          <TargetGroup
            key={item.name}
            loadBalancer={loadBalancer as ITencentcloudApplicationLoadBalancer}
            targetGroup={item}
            showInstances={showInstances}
            showServerGroups={showServerGroups}
          />
        );
      })
    : [];
  return <div className="cluster-container">{ServerGroups}</div>;
}

export const TencentcloudLoadBalancerClusterContainer = React.memo(
  TencentcloudLoadBalancerClusterContainerCom,
  (props, nextProps) => {
    const serverGroupsDiffer = () =>
      !isEqual(
        (nextProps.serverGroups || []).map((g: { name: any }) => g.name),
        (props.serverGroups || []).map((g: { name: any }) => g.name),
      );
    const targetGroupsDiffer = () =>
      !isEqual(
        ((nextProps.loadBalancer as ITencentcloudApplicationLoadBalancer).targetGroups || []).map(t => t.name),
        ((props.loadBalancer as ITencentcloudApplicationLoadBalancer).targetGroups || []).map(t => t.name),
      );
    return !(
      nextProps.showInstances !== props.showInstances ||
      nextProps.showServerGroups !== props.showServerGroups ||
      nextProps.loadBalancer !== props.loadBalancer ||
      serverGroupsDiffer() ||
      targetGroupsDiffer()
    );
  },
);
