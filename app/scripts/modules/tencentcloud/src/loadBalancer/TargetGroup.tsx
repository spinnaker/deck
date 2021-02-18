import * as React from 'react';
import { useEffect, useState } from 'react';
import { orderBy } from 'lodash';
import { LoadBalancerInstances, LoadBalancerServerGroup, API, IServerGroup } from '@spinnaker/core';

import { ITencentcloudApplicationLoadBalancer, ITargetGroup } from 'tencentcloud/domain/ITencentcloudLoadBalancer';

import './targetGroup.less';

export interface ITargetGroupProps {
  loadBalancer: ITencentcloudApplicationLoadBalancer;
  targetGroup: ITargetGroup;
  showServerGroups: boolean;
  showInstances: boolean;
}

export function TargetGroup(props: ITargetGroupProps): React.ReactElement {
  const { showInstances, showServerGroups } = props;
  const [serverGroups, setServerGroups] = useState<IServerGroup[]>([]);

  useEffect(() => {
    const {
      loadBalancer: { application, id },
    } = props;
    API.one('applications')
      .one(application)
      .all('serverGroups')
      .getList()
      .then((serverGroups: IServerGroup[]) => {
        const result = serverGroups
          .filter(sg => sg.loadBalancers && sg.loadBalancers[0] === id)
          .map(sg => ({
            ...sg,
            detachedInstances: [],
            instances: sg.instances.map(i => ({
              ...i,
              cloudProvider: sg.cloudProvider,
            })),
          }));
        setServerGroups(result);
      });
  }, []);

  const ServerGroups = orderBy(serverGroups, ['isDisabled', 'name'], ['asc', 'desc']).map(serverGroup => (
    <LoadBalancerServerGroup
      key={serverGroup.name}
      account={serverGroup.account}
      region={serverGroup.region}
      serverGroup={serverGroup}
      showInstances={showInstances}
    />
  ));
  return (
    <div className="target-group-container container-fluid no-padding">
      {showServerGroups && ServerGroups}
      {!showServerGroups && showInstances && (
        <LoadBalancerInstances
          serverGroups={serverGroups}
          instances={serverGroups.reduce((a, c) => a.concat(c.instances), [])}
        />
      )}
    </div>
  );
}
