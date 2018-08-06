import * as React from 'react';
import { Subject } from 'rxjs';

import { IServerGroup, IInstance } from 'core/domain';
import { InstanceListBody } from 'core/instance/InstanceListBody';
import { SortToggle } from 'core/presentation/sortToggle/SortToggle';
import { ISortFilter } from 'core/filterModel';
import { ReactInjector } from 'core/reactShims';
import { ClusterState } from 'core/state';

export interface IInstanceListProps {
  hasDiscovery: boolean;
  hasLoadBalancers: boolean;
  instances: IInstance[];
  sortFilter: ISortFilter;
  serverGroup: IServerGroup;
}

export interface IInstanceListState {
  multiselect: boolean;
  allSelected: boolean;
}

interface IColumnWidths {
  id: number;
  launchTime: number;
  zone: number;
  discovery: number;
  loadBalancers: number;
  cloudProvider: number;
}

export class InstanceList extends React.Component<IInstanceListProps, IInstanceListState> {
  private instanceGroup: any;
  private clusterFilterModel = ClusterState.filterModel.asFilterModel;
  private $state = ReactInjector.$state;
  private $uiRouter = ReactInjector.$uiRouter;
  private destroy$ = new Subject();

  constructor(props: IInstanceListProps) {
    super(props);
    this.instanceGroup = ClusterState.multiselectModel.getOrCreateInstanceGroup(props.serverGroup);
    this.state = {
      multiselect: this.$state.params.multiselect,
      allSelected: this.instanceGroup.selectAll,
    };
  }

  public componentDidMount() {
    ClusterState.multiselectModel.instancesStream.takeUntil(this.destroy$).subscribe(() => {
      this.setState({ allSelected: this.instanceGroup.selectAll });
    });

    this.$uiRouter.globals.params$
      .map(params => params.multiselect)
      .distinctUntilChanged()
      .takeUntil(this.destroy$)
      .subscribe(() => {
        this.setState({
          multiselect: this.$state.params.multiselect,
        });
      });
  }

  public componentWillUnmount() {
    this.destroy$.next();
  }

  private toggleSelectAll = (event: React.MouseEvent<HTMLElement>): void => {
    event.stopPropagation();
    const { instances, serverGroup } = this.props;
    const selectedInstances = instances.map(i => i.id);
    ClusterState.multiselectModel.toggleSelectAll(serverGroup, selectedInstances);
    this.setState({ allSelected: !this.state.allSelected });
  };

  private getColumnWidths(): IColumnWidths {
    const { hasDiscovery, hasLoadBalancers } = this.props;

    let additionalOffset = 0;
    if (!hasDiscovery) {
      additionalOffset += 3;
    }
    if (!hasLoadBalancers) {
      additionalOffset += 7;
    }
    if (!hasDiscovery && !hasLoadBalancers) {
      additionalOffset -= 7;
    }

    return {
      id: 21 + additionalOffset,
      launchTime: 23 + additionalOffset,
      zone: 12 + additionalOffset,
      discovery: 14 + additionalOffset,
      loadBalancers: 31 + additionalOffset,
      cloudProvider: 31,
    };
  }

  public shouldComponentUpdate(nextProps: IInstanceListProps, nextState: IInstanceListState): boolean {
    if (this.props.serverGroup.stringVal !== nextProps.serverGroup.stringVal) {
      return true;
    }
    if (
      this.props.instances
        .map(i => i.id)
        .sort()
        .join(',') !==
      nextProps.instances
        .map(i => i.id)
        .sort()
        .join(',')
    ) {
      return true;
    }
    return this.state.multiselect !== nextState.multiselect || this.state.allSelected !== nextState.allSelected;
  }

  private toggleSort = (sortKey: string): void => {
    this.clusterFilterModel.sortFilter.instanceSort = sortKey;
    this.clusterFilterModel.applyParamsToUrl();
  };

  private renderHeader(): JSX.Element {
    const { hasDiscovery, hasLoadBalancers } = this.props;
    const { sortFilter } = this.clusterFilterModel;
    const sortKey = sortFilter.instanceSort;
    const showProviderHealth = !hasDiscovery && !hasLoadBalancers;
    const columnWidths = this.getColumnWidths();

    return (
      <thead>
        <tr>
          {this.state.multiselect && (
            <th style={{ width: '3%' }}>
              <input type="checkbox" readOnly={true} checked={this.state.allSelected} onClick={this.toggleSelectAll} />
            </th>
          )}
          <th style={{ width: columnWidths.id + '%' }}>
            <SortToggle currentSort={sortKey} onChange={this.toggleSort} sortKey="id" label="Instance" />
          </th>
          <th style={{ width: columnWidths.launchTime + '%' }}>
            <SortToggle currentSort={sortKey} onChange={this.toggleSort} sortKey="launchTime" label="Launch Time" />
          </th>
          <th style={{ width: columnWidths.zone + '%' }}>
            <SortToggle currentSort={sortKey} onChange={this.toggleSort} sortKey="availabilityZone" label="Zone" />
          </th>
          {hasDiscovery && (
            <th style={{ width: columnWidths.discovery + '%' }} className="text-center">
              <SortToggle currentSort={sortKey} onChange={this.toggleSort} sortKey="discoveryState" label="Discovery" />
            </th>
          )}
          {hasLoadBalancers && (
            <th style={{ width: columnWidths.loadBalancers + '%' }}>
              <SortToggle
                currentSort={sortKey}
                onChange={this.toggleSort}
                sortKey="loadBalancerSort"
                label="Load Balancers"
              />
            </th>
          )}
          {showProviderHealth && (
            <th style={{ width: columnWidths.cloudProvider + '%' }} className="text-center">
              <SortToggle currentSort={sortKey} onChange={this.toggleSort} sortKey="providerHealth" label="Provider" />
            </th>
          )}
        </tr>
      </thead>
    );
  }

  public render() {
    const { instances } = this.props;
    if (!instances.length) {
      return <div />;
    }
    const Header = this.renderHeader();

    return (
      <table className="table table-hover table-condensed instances">
        {Header}
        <InstanceListBody {...this.props} />
      </table>
    );
  }
}
