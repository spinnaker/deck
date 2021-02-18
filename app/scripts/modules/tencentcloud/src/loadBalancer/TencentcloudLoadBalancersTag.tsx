import * as React from 'react';
import * as ReactGA from 'react-ga';
import { sortBy } from 'lodash';

import {
  HealthCounts,
  ILoadBalancer,
  ILoadBalancersTagProps,
  LoadBalancerDataUtils,
  ReactInjector,
  Tooltip,
  HoverablePopover,
  Spinner,
} from '@spinnaker/core';

import { TencentcloudLoadBalancerDataUtils } from './TencentcloudLoadBalancerDataUtils';
import { ITencentcloudServerGroup, ITargetGroup } from 'tencentcloud/domain';
import { useEffect, useState } from 'react';

interface ILoadBalancerListItemProps {
  loadBalancer: ILoadBalancer | ITargetGroup;
  onItemClick: (loadBalancer: ILoadBalancer | ITargetGroup) => void;
}

interface ILoadBalancerSingleItemProps extends ILoadBalancerListItemProps {
  label: string;
}

function LoadBalancerListItem(props: ILoadBalancerListItemProps) {
  const onClick = (e: React.MouseEvent<HTMLElement>): void => {
    props.onItemClick(props.loadBalancer);
    e.nativeEvent.preventDefault();
  };
  return (
    <a onClick={onClick}>
      <span className="name">{props.loadBalancer.name}</span>
      <HealthCounts container={props.loadBalancer.instanceCounts} />
    </a>
  );
}

function LoadBalancerButton(props: ILoadBalancerSingleItemProps) {
  const onClick = (e: React.MouseEvent<HTMLElement>): void => {
    props.onItemClick(props.loadBalancer);
    e.nativeEvent.preventDefault();
  };

  return (
    <Tooltip value={`${props.label || 'Load Balancer'}: ${props.loadBalancer.name}`}>
      <button className="btn btn-link no-padding" onClick={onClick}>
        <span className="badge badge-counter">
          <span className="icon">
            <i className="fa icon-sitemap" />
          </span>
        </span>
      </button>
    </Tooltip>
  );
}

export interface ITencentcloudLoadBalancersTagState {
  loadBalancers: ILoadBalancer[];
  targetGroups: ITargetGroup[];
  isLoading: boolean;
}

function useForceUpdate() {
  const [, forceUpdate] = React.useState();

  return React.useCallback(() => {
    forceUpdate((s: boolean) => !s);
  }, []);
}

export function TencentcloudLoadBalancersTag(props: ILoadBalancersTagProps) {
  const [loadBalancers, setLoadBalancers] = useState<ILoadBalancer[]>([]);
  const [targetGroups, setTargetGroups] = useState<ITargetGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const forceUpdate = useForceUpdate();
  const renderCount = React.useRef(0);
  React.useEffect(() => {
    renderCount.current += 1;
  });

  const update = React.useCallback(() => {
    forceUpdate();
  }, [forceUpdate]);

  let loadBalancersRefreshUnsubscribe: () => void;
  let mounted = false;

  useEffect(() => {
    mounted = true;
    loadBalancersRefreshUnsubscribe = props.application.getDataSource('loadBalancers').onRefresh(null, () => {
      update();
    });

    LoadBalancerDataUtils.populateLoadBalancers(props.application, props.serverGroup).then((loadBalancers: any) => {
      if (mounted) {
        setLoadBalancers(loadBalancers);
        setIsLoading(false);
      }
    });
    TencentcloudLoadBalancerDataUtils.populateTargetGroups(
      props.application,
      props.serverGroup as ITencentcloudServerGroup,
    ).then((targetGroups: ITargetGroup[]) => {
      if (mounted) {
        setTargetGroups(targetGroups);
      }
    });
    return () => {
      mounted = false;
      loadBalancersRefreshUnsubscribe();
    };
  }, []);

  const showLoadBalancerDetails = (loadBalancer: ILoadBalancer): void => {
    const { $state } = ReactInjector;
    const serverGroup = props.serverGroup;
    ReactGA.event({ category: 'Cluster Pod', action: `Load Load Balancer Details (multiple menu)` });
    const nextState = $state.current.name.endsWith('.clusters') ? '.loadBalancerDetails' : '^.loadBalancerDetails';
    $state.go(nextState, {
      region: serverGroup.region,
      accountId: serverGroup.account,
      name: loadBalancer.name,
      provider: serverGroup.type,
    });
  };

  const showTargetGroupDetails = (targetGroup: ITargetGroup): void => {
    const { $state } = ReactInjector;
    ReactGA.event({ category: 'Cluster Pod', action: `Load Target Group Details (multiple menu)` });
    const nextState = $state.current.name.endsWith('.clusters') ? '.targetGroupDetails' : '^.targetGroupDetails';
    $state.go(nextState, {
      region: targetGroup.region,
      accountId: targetGroup.account,
      name: targetGroup.name,
      provider: 'tencentcloud',
      loadBalancerName: targetGroup.loadBalancerNames[0],
    });
  };

  const handleShowPopover = () => {
    ReactGA.event({ category: 'Cluster Pod', action: `Show Load Balancers Menu` });
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const targetGroupCount = (targetGroups && targetGroups.length) || 0;
  const loadBalancerCount = (loadBalancers && loadBalancers.length) || 0;
  const totalCount = targetGroupCount + loadBalancerCount;

  if (!totalCount) {
    return isLoading ? <Spinner size="nano" /> : null;
  }

  const className = `load-balancers-tag ${totalCount > 1 ? 'overflowing' : ''}`;
  const popover = (
    <div className="menu-load-balancers">
      {loadBalancerCount > 0 && <div className="menu-load-balancers-header">Load Balancers</div>}
      {sortBy(loadBalancers, 'name').map(loadBalancer => (
        <LoadBalancerListItem
          key={loadBalancer.name}
          loadBalancer={loadBalancer}
          onItemClick={showLoadBalancerDetails}
        />
      ))}

      {targetGroupCount > 0 && <div className="menu-load-balancers-header">Target Groups</div>}
      {sortBy(targetGroups, 'name').map(targetGroup => (
        <LoadBalancerListItem key={targetGroup.name} loadBalancer={targetGroup} onItemClick={showTargetGroupDetails} />
      ))}
    </div>
  );

  return (
    <span className={className}>
      {totalCount > 1 && (
        <HoverablePopover
          delayShow={100}
          delayHide={150}
          onShow={handleShowPopover}
          placement="bottom"
          template={popover}
          hOffsetPercent="80%"
          container={props.container}
          className="no-padding menu-load-balancers"
        >
          <button onClick={handleClick} className="btn btn-link btn-multiple-load-balancers clearfix no-padding">
            <span className="badge badge-counter">
              <span className="icon">
                <i className="fa icon-sitemap" />
              </span>{' '}
              {totalCount}
            </span>
          </button>
        </HoverablePopover>
      )}

      {loadBalancers.length === 1 && targetGroups.length === 0 && (
        <span className="btn-load-balancer">
          <LoadBalancerButton
            key={loadBalancers[0].name}
            label="Load Balancer"
            loadBalancer={loadBalancers[0]}
            onItemClick={showLoadBalancerDetails}
          />
        </span>
      )}

      {targetGroups.length === 1 && loadBalancers.length === 0 && (
        <span className="btn-load-balancer">
          <LoadBalancerButton
            key={targetGroups[0].name}
            label="Target Group"
            loadBalancer={targetGroups[0]}
            onItemClick={showTargetGroupDetails}
          />
        </span>
      )}
    </span>
  );
}
