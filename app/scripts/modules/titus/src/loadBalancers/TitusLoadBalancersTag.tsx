// This is all mercilessly copied from LoadBalancersTag.tsx. This should be clenaed up at some point
// Probably when we convert clusters view to React.

import * as React from 'react';
import * as ReactGA from 'react-ga';
import { BindAll } from 'lodash-decorators';
import { sortBy } from 'lodash';

import {
  HealthCounts, ILoadBalancer, ILoadBalancersTagProps, ReactInjector, Tooltip, HoverablePopover
} from '@spinnaker/core';

import { AmazonLoadBalancerDataUtils } from '@spinnaker/amazon/lib/loadBalancer/amazonLoadBalancerDataUtils';
import { IAmazonServerGroup, ITargetGroup } from '@spinnaker/amazon';

interface ILoadBalancerListItemProps {
  loadBalancer: ILoadBalancer | ITargetGroup;
  onItemClick: (loadBalancer: ILoadBalancer | ITargetGroup) => void;
}

interface ILoadBalancerSingleItemProps extends ILoadBalancerListItemProps {
  label: string;
}

@BindAll()
class LoadBalancerListItem extends React.Component<ILoadBalancerListItemProps> {
  private onClick(e: React.MouseEvent<HTMLElement>): void {
    this.props.onItemClick(this.props.loadBalancer);
    e.nativeEvent.preventDefault(); // yay angular JQueryEvent still listening to the click event...
  }

  public render(): React.ReactElement<LoadBalancerListItem> {
    return (
      <a onClick={this.onClick}>
        <span className="name">{this.props.loadBalancer.name}</span>
        <HealthCounts container={this.props.loadBalancer.instanceCounts}/>
      </a>
    )
  }
}

@BindAll()
class LoadBalancerButton extends React.Component<ILoadBalancerSingleItemProps> {
  private onClick(e: React.MouseEvent<HTMLElement>): void {
    this.props.onItemClick(this.props.loadBalancer);
    e.nativeEvent.preventDefault(); // yay angular JQueryEvent still listening to the click event...
  }

  public render(): React.ReactElement<LoadBalancerButton> {
    return (
      <Tooltip value={`${this.props.label || 'Load Balancer'}: ${this.props.loadBalancer.name}`}>
        <button className="btn btn-link no-padding" onClick={this.onClick}>
          <span className="badge badge-counter">
            <span className="icon">
              <span className="icon-elb"/>
            </span>
          </span>
        </button>
      </Tooltip>
    )
  }
}

export interface IAmazonLoadBalancersTagState {
  targetGroups: ITargetGroup[];
}

@BindAll()
export class TitusLoadBalancersTag extends React.Component<ILoadBalancersTagProps, IAmazonLoadBalancersTagState> {
  private loadBalancersRefreshUnsubscribe: () => void;
  private mounted = false;

  constructor(props: ILoadBalancersTagProps) {
    super(props);
    this.state = {
      targetGroups: [],
    };

    AmazonLoadBalancerDataUtils.populateTargetGroups(props.application, props.serverGroup as IAmazonServerGroup)
      .then((targetGroups: ITargetGroup[]) => {
        if (this.mounted) {
          this.setState({ targetGroups });
        }
      });
  }

  private showTargetGroupDetails(targetGroup: ITargetGroup): void {
    const { $state } = ReactInjector;
    ReactGA.event({ category: 'Cluster Pod', action: `Load Target Group Details (multiple menu)` });
    const nextState = $state.current.name.endsWith('.clusters') ? '.targetGroupDetails' : '^.targetGroupDetails';
    $state.go(nextState, { region: targetGroup.region, accountId: targetGroup.account, name: targetGroup.name, provider: 'aws', loadBalancerName: targetGroup.loadBalancerNames[0] });
  }

  private handleShowPopover() {
    ReactGA.event({ category: 'Cluster Pod', action: `Show Load Balancers Menu` });
  }

  private handleClick(e: React.MouseEvent<HTMLElement>): void {
    e.preventDefault();
    e.stopPropagation();
  }

  public componentDidMount(): void {
    this.mounted = true;
    this.loadBalancersRefreshUnsubscribe = this.props.application.getDataSource('loadBalancers').onRefresh(null, () => { this.forceUpdate(); });
  }

  public componentWillUnmount(): void {
    this.mounted = false;
    this.loadBalancersRefreshUnsubscribe();
  }

  public render(): React.ReactElement<TitusLoadBalancersTag> {
    const { targetGroups } = this.state;

    const targetGroupCount = targetGroups && targetGroups.length || 0,
      totalCount = targetGroupCount;

    if (!totalCount) {
      return null;
    }

    const className = `load-balancers-tag ${totalCount > 1 ? 'overflowing' : ''}`;
    const popover = (
      <div className="menu-load-balancers">
        {targetGroupCount > 0 && <div className="menu-load-balancers-header">Target Groups</div>}
        {sortBy(targetGroups, 'name').map((targetGroup) => (
          <LoadBalancerListItem key={targetGroup.name} loadBalancer={targetGroup} onItemClick={this.showTargetGroupDetails}/>
        ))}
      </div>
    );

    return (
      <span className={className}>
        { totalCount > 1 && (
          <HoverablePopover
            delayShow={100}
            delayHide={150}
            onShow={this.handleShowPopover}
            placement="bottom"
            template={popover}
            hOffsetPercent="80%"
            container={this.props.container}
            className="no-padding menu-load-balancers"
          >
            <button onClick={this.handleClick} className="btn btn-link btn-multiple-load-balancers clearfix no-padding" >
              <span className="badge badge-counter">
                <span className="icon"><span className="icon-elb"/></span> {totalCount}
              </span>
            </button>
          </HoverablePopover>
        )}

        { (targetGroups.length === 1) && (
          <span className="btn-load-balancer">
            <LoadBalancerButton key={targetGroups[0].name} label="Target Group" loadBalancer={targetGroups[0]} onItemClick={this.showTargetGroupDetails}/>
          </span>
        )}
      </span>
    )
  }
}
