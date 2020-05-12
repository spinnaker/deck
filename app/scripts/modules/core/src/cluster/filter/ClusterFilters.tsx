import React from 'react';
import { useOnStateChanged } from '@uirouter/react';
import { compact, debounce, uniq, map } from 'lodash';

import { Application } from 'core/application';
import { ClusterState } from 'core/state';
import { FilterCheckbox, ISortFilter, digestDependentFilters } from 'core/filterModel';
import { robotToHuman, useDataSource, useObservable } from 'core/presentation';
import {
  buildLabelsMap,
  labelFiltersToTrueKeyObject,
  trueKeyObjectToLabelFilters,
  ILabelFilter,
} from './labelFilterUtils';

import { poolBuilder } from './clusterDependentFilterHelper.service';
import { FilterSection } from './FilterSection';
import LabelFilter from './LabelFilter';

export interface IClusterFiltersProps {
  app: Application;
}

interface IClusterHeaders {
  account: string[];
  availabilityZone: string[];
  category: string[];
  detail: string[];
  instanceType: string[];
  providerType: string[];
  region: string[];
  stack: string[];
}

export const ClusterFilters = ({ app }: IClusterFiltersProps) => {
  const { serverGroups } = app;
  const { data: serverGroupData, loaded: clustersLoaded } = useDataSource(serverGroups);

  const [tags, setTags] = React.useState(ClusterState.filterModel.asFilterModel.tags);
  const [sortFilter, setSortFilter] = React.useState<ISortFilter>(ClusterState.filterModel.asFilterModel.sortFilter);
  const [labelFilters, setLabelFilters] = React.useState<ILabelFilter[]>(
    trueKeyObjectToLabelFilters(sortFilter.labels),
  );

  const labelsMap = buildLabelsMap(serverGroupData);
  const showLabelFilter = Object.keys(labelsMap).length > 0;

  const getHeadingsForOption = (option: string): string[] =>
    compact(uniq(map(serverGroupData, option) as string[])).sort();
  const [headings, setHeadings] = React.useState<IClusterHeaders>({
    account: [],
    availabilityZone: [],
    category: getHeadingsForOption('category'),
    detail: ['(none)'].concat(getHeadingsForOption('detail')),
    instanceType: [],
    providerType: [],
    region: [],
    stack: ['(none)'].concat(getHeadingsForOption('stack')),
  });

  useObservable(ClusterState.filterService.groupsUpdatedStream, () => {
    setTags(ClusterState.filterModel.asFilterModel.tags);
  });

  useOnStateChanged(() => {
    ClusterState.filterModel.asFilterModel.activate();
    ClusterState.filterService.updateClusterGroups(app);
  });

  const clearFilters = () => {
    ClusterState.filterService.clearFilters();
    ClusterState.filterModel.asFilterModel.applyParamsToUrl();
    ClusterState.filterService.updateClusterGroups(app);
  };

  const updateClusterGroups = (applyParamsToUrl = true) => {
    const { providerType, instanceType, account, availabilityZone, region } = digestDependentFilters({
      sortFilter: ClusterState.filterModel.asFilterModel.sortFilter,
      dependencyOrder: ['providerType', 'account', 'region', 'availabilityZone', 'instanceType'],
      pool: poolBuilder(serverGroupData),
    });

    setHeadings({
      ...headings,
      account,
      availabilityZone,
      instanceType,
      providerType,
      region,
    });

    if (applyParamsToUrl) {
      ClusterState.filterModel.asFilterModel.applyParamsToUrl();
    }
    ClusterState.filterService.updateClusterGroups(app);
  };

  const handleLabelFiltersChange = (filters: ILabelFilter[]): void => {
    setLabelFilters(filters);
    setSortFilter({
      ...sortFilter,
      labels: labelFiltersToTrueKeyObject(filters),
    });
    updateClusterGroups();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    const newSortFilter = {
      ...sortFilter,
      filter: searchTerm,
    };
    setSortFilter(newSortFilter);
    ClusterState.filterModel.asFilterModel.sortFilter = newSortFilter;
    updateClusterGroups();
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    // eslint-disable-next-line
    console.log(value, name);
    const newSortFilter = {
      ...sortFilter,
      status: {
        ...sortFilter.status,
        [name]: Boolean(value),
      },
    };
    setSortFilter(newSortFilter);
    ClusterState.filterModel.asFilterModel.sortFilter = newSortFilter;
    updateClusterGroups();
  };

  const handleMinInstanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const min = parseInt(event.target.value, 10);
    const newSortFilter = {
      ...sortFilter,
      minInstances: min,
    };
    setSortFilter(newSortFilter);
    ClusterState.filterModel.asFilterModel.sortFilter = newSortFilter;
    updateClusterGroups();
  };

  const handleMaxInstanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const max = parseInt(event.target.value, 10);
    const newSortFilter = {
      ...sortFilter,
      maxInstances: max,
    };
    setSortFilter(newSortFilter);
    ClusterState.filterModel.asFilterModel.sortFilter = newSortFilter;
    updateClusterGroups();
  };

  React.useEffect(() => {
    updateClusterGroups();
  }, []);

  return (
    <div className="insight-filter-content">
      <div className="heading">
        <span
          className="btn btn-default btn-xs"
          style={{ visibility: tags.length > 0 ? 'inherit' : 'hidden' }}
          onClick={clearFilters}
        >
          Clear All
        </span>
        <FilterSection heading="Search" expanded={true} helpKey="cluster.search">
          <form className="form-horizontal" role="form">
            <div className="form-group nav-search">
              <input
                type="search"
                className="form-control input-sm"
                value={sortFilter.filter}
                onBlur={handleSearchChange}
                onChange={debounce(handleSearchChange)}
                style={{ width: '85%', display: 'inline-block' }}
              />
            </div>
          </form>
        </FilterSection>
      </div>
      {clustersLoaded && (
        <div className="content">
          {headings.providerType.length > 1 && (
            <FilterSection heading="Provider" expanded={true}>
              {headings.providerType.map(heading => (
                <FilterCheckbox
                  heading={heading}
                  isCloudProvider={true}
                  key={heading}
                  sortFilterType={sortFilter.providerType}
                  onChange={updateClusterGroups}
                />
              ))}
            </FilterSection>
          )}
          <FilterSection heading="Account" expanded={true}>
            {headings.account.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.account}
                onChange={updateClusterGroups}
              />
            ))}
          </FilterSection>
          <FilterSection heading="Region" expanded={true}>
            {headings.region.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.region}
                onChange={updateClusterGroups}
              />
            ))}
          </FilterSection>
          <FilterSection heading="Category" expanded={true}>
            {headings.category.map(heading => (
              <FilterCheckbox
                heading={robotToHuman(heading)}
                key={heading}
                sortFilterType={sortFilter.category}
                onChange={updateClusterGroups}
              />
            ))}
          </FilterSection>
          <FilterSection heading="Stack" expanded={true}>
            {headings.stack.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.stack}
                onChange={updateClusterGroups}
              />
            ))}
          </FilterSection>
          <FilterSection heading="Detail" expanded={true}>
            {headings.detail.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.detail}
                onChange={updateClusterGroups}
              />
            ))}
          </FilterSection>
          <FilterSection heading="Status" expanded={true}>
            <div className="form">
              {['Up', 'Down', 'Disabled', 'Starting', 'OutOfService', 'Unknown'].map(status => (
                <div className="checkbox">
                  <label>
                    <input
                      key={status}
                      type="checkbox"
                      checked={Boolean(sortFilter.status && sortFilter.status[status])}
                      onChange={handleStatusChange}
                      name={status}
                    />
                    {robotToHuman(status)}
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>
          <FilterSection heading="Availability Zones" expanded={true}>
            {headings.availabilityZone.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.availabilityZone}
                onChange={updateClusterGroups}
              />
            ))}
          </FilterSection>
          <FilterSection heading="Instance Types" expanded={true}>
            {headings.instanceType.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.instanceType}
                onChange={updateClusterGroups}
              />
            ))}
          </FilterSection>
          <FilterSection heading="Instance Count" expanded={true}>
            <div className="form-inline">
              <div className="form-group">
                Min:
                <input
                  type="number"
                  className="form-control input-sm"
                  value={sortFilter.minInstances}
                  onChange={handleMinInstanceChange}
                />
              </div>
              <div className="form-group">
                Max:
                <input
                  type="number"
                  className="form-control input-sm"
                  value={sortFilter.maxInstances}
                  onChange={handleMaxInstanceChange}
                />
              </div>
            </div>
          </FilterSection>
          {showLabelFilter && (
            <FilterSection heading="Labels" expanded={true}>
              <LabelFilter
                labelsMap={labelsMap}
                labelFilters={labelFilters}
                updateLabelFilters={handleLabelFiltersChange}
              />
            </FilterSection>
          )}
        </div>
      )}
    </div>
  );
};
