import React from 'react';
import { useOnStateChanged } from '@uirouter/react';
import { chain, compact, uniq, map } from 'lodash';

import { Application } from 'core/application';
import { FilterCheckbox, ISortFilter, digestDependentFilters } from 'core/filterModel';
import { useDataSource, useObservable } from 'core/presentation';
import { FilterSection } from 'core/cluster/filter/FilterSection';
import { SecurityGroupState } from 'core/state';

export interface ISecurityGroupFiltersProps {
  app: Application;
}

interface ISecurityGroupHeaders {
  account: string[];
  detail: string[];
  providerType: string[];
  region: string[];
  stack: string[];
}

interface IPoolItem {
  providerType: string;
  account: string;
  region: string;
}

const poolValueCoordinates = [
  { filterField: 'providerType', on: 'securityGroup', localField: 'provider' },
  { filterField: 'account', on: 'securityGroup', localField: 'account' },
  { filterField: 'region', on: 'securityGroup', localField: 'region' },
];

const poolBuilder = (securityGroups: any[]): IPoolItem[] => {
  const pool = securityGroups.map(sg => {
    const poolUnit = chain(poolValueCoordinates)
      .filter({ on: 'securityGroup' })
      .reduce((poolUnitTemplate: any, coordinate) => {
        poolUnitTemplate[coordinate.filterField] = sg[coordinate.localField];
        return poolUnitTemplate;
      }, {})
      .value();

    return poolUnit;
  });

  return pool;
};

export const SecurityGroupFilters = ({ app }: ISecurityGroupFiltersProps) => {
  const { securityGroups } = app;
  const { data: securityGroupData, loaded: securityGroupsLoaded } = useDataSource(securityGroups);

  const [tags, setTags] = React.useState(SecurityGroupState.filterModel.asFilterModel.tags);
  const [sortFilter, setSortFilter] = React.useState<ISortFilter>(
    SecurityGroupState.filterModel.asFilterModel.sortFilter,
  );

  useObservable(SecurityGroupState.filterService.groupsUpdatedStream, () => {
    setTags(SecurityGroupState.filterModel.asFilterModel.tags);
    setSortFilter(SecurityGroupState.filterModel.asFilterModel.sortFilter);
  });

  useOnStateChanged(() => {
    SecurityGroupState.filterModel.asFilterModel.activate();
  });

  const getHeadingsForOption = (option: string): string[] =>
    compact(uniq(map(securityGroupData, option) as string[])).sort();
  const [headings, setHeadings] = React.useState<ISecurityGroupHeaders>({
    account: [],
    detail: ['(none)'].concat(getHeadingsForOption('detail')),
    providerType: getHeadingsForOption('provider'),
    region: [],
    stack: ['(none)'].concat(getHeadingsForOption('stack')),
  });

  const updateSecurityGroups = (applyParamsToUrl = true): void => {
    const { account, region } = digestDependentFilters({
      sortFilter: SecurityGroupState.filterModel.asFilterModel.sortFilter,
      dependencyOrder: ['providerType', 'account', 'region'],
      pool: poolBuilder(securityGroupData),
    });

    setHeadings({
      ...headings,
      account,
      region,
    });

    if (applyParamsToUrl) {
      SecurityGroupState.filterModel.asFilterModel.applyParamsToUrl();
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    const newSortFilter = {
      ...sortFilter,
      filter: searchTerm,
    };
    setSortFilter(newSortFilter);
    SecurityGroupState.filterModel.asFilterModel.sortFilter = newSortFilter;
    updateSecurityGroups();
  };

  const clearFilters = (): void => {
    SecurityGroupState.filterService.clearFilters();
    SecurityGroupState.filterService.updateSecurityGroups(app);
    updateSecurityGroups(false);
  };

  React.useEffect(() => {
    updateSecurityGroups();
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
        <FilterSection key="filter-search" heading="Search" expanded={true} helpKey="securityGroup.search">
          <form className="form-horizontal" role="form">
            <div className="form-group nav-search">
              <input
                type="search"
                className="form-control input-sm"
                value={sortFilter.filter}
                onBlur={handleSearchChange}
                onChange={handleSearchChange}
                style={{ width: '85%', display: 'inline-block' }}
              />
            </div>
          </form>
        </FilterSection>
      </div>
      {securityGroupsLoaded && (
        <div className="content">
          {headings.providerType.length > 1 && (
            <FilterSection key="filter-provider" heading="Provider" expanded={true}>
              {headings.providerType.map(heading => (
                <FilterCheckbox
                  heading={heading}
                  isCloudProvider={true}
                  key={heading}
                  sortFilterType={sortFilter.providerType}
                  onChange={updateSecurityGroups}
                />
              ))}
            </FilterSection>
          )}
          <FilterSection key="filter-account" heading="Account" expanded={true}>
            {headings.account.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.account}
                onChange={updateSecurityGroups}
              />
            ))}
          </FilterSection>
          <FilterSection key="filter-region" heading="Region" expanded={true}>
            {headings.region.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.region}
                onChange={updateSecurityGroups}
              />
            ))}
          </FilterSection>
          <FilterSection key="filter-stack" heading="Stack" expanded={true}>
            {headings.stack.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.stack}
                onChange={updateSecurityGroups}
              />
            ))}
          </FilterSection>
          <FilterSection key="filter-detail" heading="Detail" expanded={true}>
            {headings.detail.map(heading => (
              <FilterCheckbox
                heading={heading}
                key={heading}
                sortFilterType={sortFilter.detail}
                onChange={updateSecurityGroups}
              />
            ))}
          </FilterSection>
        </div>
      )}
    </div>
  );
};
