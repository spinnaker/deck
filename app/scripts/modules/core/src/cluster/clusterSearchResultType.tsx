import * as React from 'react';

import {
  searchResultTypeRegistry, AccountCell, BasicCell, HrefCell,
  ISearchResult
} from 'core/search';
import { SearchResultTab } from 'core/search/searchResult/SearchResultTab';
import { HeaderCell, TableBody, TableHeader, TableRow } from 'core';

export interface IClusterSearchResult extends ISearchResult {
  account: string;
  application: string;
  cluster: string;
  email?: string;
  stack: string;
}

const cols = {
  CLUSTER: { key: 'cluster', label: 'Name', cellRenderer: HrefCell },
  ACCOUNTS: { key: 'accounts', cellRenderer: AccountCell },
  EMAIL: { key: 'email', cellRenderer: BasicCell }
};

const iconClass = 'fa fa-th';
const displayName = 'Clusters';

const itemKeyFn = (item: IClusterSearchResult) => item.cluster;
const itemSortFn = (a: IClusterSearchResult, b: IClusterSearchResult) =>
  a.cluster.localeCompare(b.cluster);

searchResultTypeRegistry.register({
  id: 'clusters',
  order: 2,
  iconClass,
  displayName,
  displayFormatter: (searchResult: IClusterSearchResult) => searchResult.cluster,
  components: {
    SearchResultTab: ({ ...props }) => (
      <SearchResultTab {...props} iconClass={iconClass} label={displayName} />
    ),

    SearchResultsHeader: () => (
      <TableHeader>
        <HeaderCell col={cols.CLUSTER}/>
        <HeaderCell col={cols.ACCOUNTS}/>
        <HeaderCell col={cols.EMAIL}/>
      </TableHeader>
    ),

    SearchResultsData: ({ results }) => (
      <TableBody>
        {results.slice().sort(itemSortFn).map(item => (
          <TableRow key={itemKeyFn(item)}>
            <HrefCell item={item} col={cols.CLUSTER} />
            <AccountCell item={item} col={cols.ACCOUNTS} />
            <BasicCell item={item} col={cols.EMAIL} />
          </TableRow>
        ))}
      </TableBody>
    )
  }
});
