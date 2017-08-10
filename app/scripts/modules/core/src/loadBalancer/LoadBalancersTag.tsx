import * as React from 'react';
import * as ReactGA from 'react-ga';
import autoBindMethods from 'class-autobind-decorator';
import { sortBy } from 'lodash';

import { ILoadBalancer } from 'core/domain';
import { ILoadBalancersTagProps } from './LoadBalancersTagWrapper';
import { HealthCounts } from 'core/healthCounts/HealthCounts';
import { LoadBalancerDataUtils } from 'core/loadBalancer/loadBalancerDataUtils';
import { Tooltip } from 'core/presentation/Tooltip';
import { ReactInjector } from 'core/reactShims';

export interface ILoadBalancersTagState {
  loadBalancers: ILoadBalancer[];
  showPopover: boolean;
};

interface ILoadBalancerListItemProps {
  loadBalancer: ILoadBalancer;
  onItemClick: (name: string) => void;
}

@autoBindMethods
class LoadBalancerListItem extends React.Component<ILoadBalancerListItemProps> {
  private onClick(e: React.MouseEvent<HTMLElement>): void {
    this.props.onItemClick(this.props.loadBalancer.name);
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

@autoBindMethods
class LoadBalancerButton extends React.Component<ILoadBalancerListItemProps> {
  private onClick(e: React.MouseEvent<HTMLElement>): void {
    this.props.onItemClick(this.props.loadBalancer.name);
    e.nativeEvent.preventDefault(); // yay angular JQueryEvent still listening to the click event...
  }

  public render(): React.ReactElement<LoadBalancerButton> {
    return (
      <Tooltip value={`Load Balancer: ${this.props.loadBalancer.name}`}>
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

@autoBindMethods
export class LoadBalancersTag extends React.Component<ILoadBalancersTagProps, ILoadBalancersTagState> {
  private loadBalancersRefreshUnsubscribe: () => void;

  constructor(props: ILoadBalancersTagProps) {
    super(props);
    this.state = {
      loadBalancers: [],
      showPopover: false
    };

    LoadBalancerDataUtils.populateLoadBalancers(props.application, props.serverGroup).then(loadBalancers => this.setState({loadBalancers}))

    this.loadBalancersRefreshUnsubscribe = props.application.getDataSource('loadBalancers').onRefresh(null, () => { this.forceUpdate(); });
  }

  private showLoadBalancerDetails(name: string): void {
    const { $state } = ReactInjector;
    const serverGroup = this.props.serverGroup;
    ReactGA.event({category: 'Cluster Pod', action: `Load Load Balancer Details (multiple menu)`});
    const nextState = $state.current.name.endsWith('.clusters') ? '.loadBalancerDetails' : '^.loadBalancerDetails';
    $state.go(nextState, {region: serverGroup.region, accountId: serverGroup.account, name: name, provider: serverGroup.type});
  }

  private toggleShowPopover(e: React.MouseEvent<HTMLElement>): void {
    ReactGA.event({category: 'Cluster Pod', action: `Toggle Load Balancers Menu (${this.state.showPopover})`});
    this.setState({showPopover: !this.state.showPopover});
    e.preventDefault();
    e.stopPropagation();
  }

  public componentWillUnmount(): void {
    if (this.loadBalancersRefreshUnsubscribe) {
      this.loadBalancersRefreshUnsubscribe();
      this.loadBalancersRefreshUnsubscribe = undefined;
    }
  }

  public render(): React.ReactElement<LoadBalancersTag> {
    const serverGroup = this.props.serverGroup;
    if (serverGroup.loadBalancers.length) {
      const className = `load-balancers-tag ${serverGroup.loadBalancers.length > 1 ? 'overflowing' : ''}`;
      return (
        <span className={className}>
          { serverGroup.loadBalancers.length > 1 && (
            <Tooltip value={`${this.state.showPopover ? 'Hide' : 'Show'} all ${serverGroup.loadBalancers.length} load balancers`}>
              <button
                className="btn btn-link btn-multiple-load-balancers clearfix no-padding"
                onClick={this.toggleShowPopover}
              >
                <span className="badge badge-counter">
                  <span className="icon"><span className="icon-elb"/></span> {serverGroup.loadBalancers.length}
                </span>
              </button>
            </Tooltip>
          )}
          { this.state.showPopover && (
            <div className="menu-load-balancers">
              <div className="menu-load-balancers-header">
                Load Balancers
              </div>
              {sortBy(this.state.loadBalancers, 'name').map((loadBalancer) => <LoadBalancerListItem key={loadBalancer.name} loadBalancer={loadBalancer} onItemClick={this.showLoadBalancerDetails}/>)}
            </div>
          )}
          { serverGroup.loadBalancers.length === 1 && (
            <span className="btn-load-balancer">
              {sortBy(this.state.loadBalancers, (lb) => lb.toString()).map((loadBalancer) => <LoadBalancerButton key={loadBalancer.name} loadBalancer={loadBalancer} onItemClick={this.showLoadBalancerDetails}/>)}
            </span>
          )}
        </span>
      )
    } else {
      return null;
    }
  }
}
