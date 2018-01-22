import * as React from 'react';
import { BindAll, Debounce } from 'lodash-decorators';
import { Subscription } from 'rxjs';

import { Application } from 'core/application/application.model';
import { FilterTags, IFilterTag } from 'core/filterModel/FilterTags';
import { ILoadBalancerGroup } from 'core/domain';
import { LoadBalancerPod } from './LoadBalancerPod';
import { Spinner } from 'core/widgets/spinners/Spinner';

import { NgReact, ReactInjector } from 'core/reactShims';
import { CreateLoadBalancerButton } from 'core/loadBalancer/CreateLoadBalancerButton';

export interface ILoadBalancersProps {
  app: Application;
}

export interface ILoadBalancersState {
  initialized: boolean;
  groups: ILoadBalancerGroup[];
  tags: IFilterTag[];
  showServerGroups: boolean;
  showInstances: boolean;
}

@BindAll()
export class LoadBalancers extends React.Component<ILoadBalancersProps, ILoadBalancersState> {
  private groupsUpdatedListener: Subscription;
  private loadBalancersRefreshUnsubscribe: () => any;

  constructor(props: ILoadBalancersProps) {
    super(props);
    const { $stateParams } = ReactInjector;
    this.state = {
      initialized: false,
      groups: [],
      tags: [],
      showServerGroups: !$stateParams.hideServerGroups || true,
      showInstances: $stateParams.showInstances || false
    };
  }

  public componentDidMount(): void {
    const { loadBalancerFilterModel, loadBalancerFilterService } = ReactInjector;
    const { app } = this.props;

    this.groupsUpdatedListener = loadBalancerFilterService.groupsUpdatedStream.subscribe(() => this.groupsUpdated());
    loadBalancerFilterModel.asFilterModel.activate();
    this.loadBalancersRefreshUnsubscribe = app.getDataSource('loadBalancers').onRefresh(null, () => this.updateLoadBalancerGroups());
    app.setActiveState(app.loadBalancers);
    this.updateLoadBalancerGroups();
  }

  public componentWillUnmount(): void {
    this.groupsUpdatedListener.unsubscribe();
    this.loadBalancersRefreshUnsubscribe();
  }

  private groupsUpdated(): void {
    const { loadBalancerFilterModel } = ReactInjector;
    this.setState({
      groups: loadBalancerFilterModel.asFilterModel.groups,
      tags: loadBalancerFilterModel.asFilterModel.tags,
    })
  }

  @Debounce(200)
  private updateLoadBalancerGroups(): void {
    const { loadBalancerFilterModel, loadBalancerFilterService } = ReactInjector;
    loadBalancerFilterModel.asFilterModel.applyParamsToUrl();
    loadBalancerFilterService.updateLoadBalancerGroups(this.props.app);
    this.groupsUpdated();

    if (this.props.app.getDataSource('loadBalancers').loaded) {
      this.setState({ initialized: true });
    }
  }

  private clearFilters(): void {
    ReactInjector.loadBalancerFilterService.clearFilters();
    this.updateLoadBalancerGroups();
  }

  private updateUIState(state: ILoadBalancersState): void {
    const params: any = {
      hideServerGroups: undefined,
      showInstances: undefined
    };
    if (!state.showServerGroups) {
      params.hideServerGroups = true;
    }
    if (state.showInstances) {
      params.showInstances = true;
    }
    ReactInjector.$state.go('.', params);
  }

  private handleInputChange(event: any): void {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    ReactInjector.loadBalancerFilterModel.asFilterModel.sortFilter[name] = value;

    const state: any = {}; // Use any type since we can't infer the property name
    state[name] = value;
    this.updateUIState(state);
    this.setState(state);
  }

  private tagCleared(): void {
    this.updateLoadBalancerGroups();
  }

  public render(): React.ReactElement<LoadBalancers> {
    const { HelpField } = NgReact;
    const groupings = this.state.initialized ? (
      <div>
        { this.state.groups.map((group) => (
          <div key={group.heading} className="rollup">
            { group.subgroups && group.subgroups.map((subgroup) => (
              <LoadBalancerPod
                key={subgroup.heading}
                grouping={subgroup}
                application={this.props.app}
                parentHeading={group.heading}
                showServerGroups={this.state.showServerGroups}
                showInstances={this.state.showInstances}
              />
            ))}
          </div>
        ))}
        {this.state.groups.length === 0 && <div><h4 className="text-center">No load balancers match the filters you've selected.</h4></div>}
      </div>
    ) : (
      <div>
        <Spinner size="medium" />
      </div>
    );

    return (
      <div className="main-content load-balancers">
        <div className="header row header-clusters">
          <div className="col-lg-8 col-md-10">
            <h3>
              Load Balancers
            </h3>
            <div className="form-inline clearfix filters">
              <div className="form-group">
                <label className="checkbox"> Show </label>
                <div className="checkbox">
                  <label> <input type="checkbox" name="showServerGroups" checked={this.state.showServerGroups} onChange={this.handleInputChange} /> Server Groups <HelpField id="loadBalancers.filter.serverGroups"/></label>
                </div>
                <div className="checkbox">
                  <label> <input type="checkbox" name="showInstances" checked={this.state.showInstances} onChange={this.handleInputChange} /> Instances <HelpField placement="right" id="loadBalancers.filter.instances"/></label>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-2">
            <div className="form-inline clearfix filters"/>
            <div className="application-actions">
              <CreateLoadBalancerButton app={this.props.app} />
            </div>
          </div>
          <FilterTags tags={this.state.tags} tagCleared={this.tagCleared} clearFilters={this.clearFilters}/>
        </div>

        <div className="content">
          {groupings}
        </div>
      </div>
    );
  }
}
