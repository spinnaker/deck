import { Application, ApplicationDataSource } from '@spinnaker/core';
import React from 'react';
import { FiltersPubSub } from '../controller/FiltersPubSub';
import { KUBERNETS_RAW_RESOURCE_DATA_SOURCE_KEY } from '../rawResource.dataSource';
import { RawResource } from './group/RawResource';
import { RawResourceGroups } from './group/RawResourceGroups';
import { IK8sResourcesFiltersState } from './K8sResourcesFilters';

export interface IK8sResourcesProps {
  app: Application;
}

interface IK8sResourcesState {
  groupBy: string;
  filters: IK8sResourcesFiltersState;
  rawResources: IApiKubernetesResource[];
}

export class K8sResources extends React.Component<IK8sResourcesProps, IK8sResourcesState> {
  private dataSource: ApplicationDataSource<IApiKubernetesResource[]>;
  private filterPubSub: FiltersPubSub = FiltersPubSub.getInstance(this.props.app.name);

  constructor(props: IK8sResourcesProps) {
    super(props);
    this.dataSource = this.props.app.getDataSource(KUBERNETS_RAW_RESOURCE_DATA_SOURCE_KEY);
    this.state = {
      groupBy: 'none',
      filters: null,
      rawResources: [],
    };

    this.filterPubSub.subscribe(this.onFilterChange.bind(this));
  }

  public onFilterChange(message: IK8sResourcesFiltersState) {
    this.setState({ ...this.state, filters: message });
  }

  public async componentDidMount() {
    await this.dataSource.ready();

    this.setState({
      ...this.state,
      groupBy: this.state.groupBy,
      rawResources: await this.dataSource.data.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)),
    });
  }

  public onGroupByChange(event: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({
      ...this.state,
      groupBy: event.target.value,
    });
  }

  public render() {
    return (
      <div style={{ width: '100%' }}>
        <form className="form-inline" style={{ marginBottom: '5px' }}>
          <div className="form-group">
            <label style={{ marginRight: '5px' }}>Group by</label>
            <select
              className="form-control input-sm"
              value={this.state.groupBy}
              onChange={this.onGroupByChange.bind(this)}
            >
              <option key="none" value="none">
                None
              </option>
              <option key="kind" value="kind">
                Kind
              </option>
              <option key="account" value="account">
                Account
              </option>
              <option key="namespace" value="namespace">
                Namespace
              </option>
            </select>
          </div>
        </form>
        {this.state.groupBy === 'none' ? (
          <>
            {...this.state.rawResources
              .filter((resource) => this.matchFilters(resource))
              .map((resource) => <RawResource resource={resource}></RawResource>)}
          </>
        ) : (
          <RawResourceGroups
            resources={this.state.rawResources.filter((resource) => this.matchFilters(resource))}
            groupBy={this.state.groupBy}
          ></RawResourceGroups>
        )}
      </div>
    );
  }

  private matchFilters(resource: IApiKubernetesResource) {
    if (this.state.filters == null) {
      return true;
    }
    const accountMatch =
      Object.values(this.state.filters.accounts).every((x) => !x) || this.state.filters.accounts[resource.account];
    const kindMatch =
      Object.values(this.state.filters.kinds).every((x) => !x) || this.state.filters.kinds[resource.kind];
    const namespaceMatch =
      Object.values(this.state.filters.namespaces).every((x) => !x) ||
      this.state.filters.namespaces[resource.namespace];
    return accountMatch && kindMatch && namespaceMatch;
  }
}
