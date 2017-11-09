import { IPromise } from 'angular';
import * as React from 'react';
import { $q } from 'ngimport';

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

const itemKeyFn = (item: IClusterSearchResult) => item.cluster;
const itemSortFn = (a: IClusterSearchResult, b: IClusterSearchResult) =>
  a.cluster.localeCompare(b.cluster);

searchResultTypeRegistry.register({
  id: 'clusters',
  columns: [ cols.CLUSTER, cols.ACCOUNTS, cols.EMAIL ],
  displayName: 'Clusters',
  order: 2,
  icon: 'th',
  itemKeyFn: itemKeyFn,
  itemSortFn: itemSortFn,
  displayFormatter(searchResult: IClusterSearchResult): IPromise<string> {
    return $q.when(searchResult.cluster);
  },
  // SearchResultsRenderer: DefaultSearchResultsRenderer,
  renderers: {
    SearchResultTab: ({ ...props }) => (
      <SearchResultTab {...props} iconClass="fa fa-th" label="Clusters" />
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
        {results.map(item => (
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
