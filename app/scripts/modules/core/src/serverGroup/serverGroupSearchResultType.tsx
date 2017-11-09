import { IPromise } from 'angular';
import * as React from 'react';
import { $q } from 'ngimport';

import {
  AccountCell, BasicCell, HrefCell, searchResultTypeRegistry,
  ISearchResult, HeaderCell, TableBody, TableHeader, TableRow,
} from 'core/search';
import { SearchResultTab } from 'core/search/searchResult/SearchResultTab';

export interface IServerGroupSearchResult extends ISearchResult {
  account: string;
  application: string;
  cluster: string;
  detail: string;
  email?: string;
  region: string;
  sequence: string;
  serverGroup: string;
  stack: string;
  url: string;
}

const cols = {
  SERVERGROUP: { key: 'serverGroup', label: 'Name', cellRenderer: HrefCell },
  ACCOUNT: { key: 'account', cellRenderer: AccountCell },
  REGION: { key: 'region', cellRenderer: BasicCell },
  EMAIL: { key: 'email', cellRenderer: BasicCell }
};

const itemKeyFn = (item: IServerGroupSearchResult) =>
  [item.serverGroup, item.account, item.region].join('|');

const itemSortFn = (a: IServerGroupSearchResult, b: IServerGroupSearchResult) => {
  let order: number = a.serverGroup.localeCompare(b.serverGroup);
  if (order === 0) {
    order = a.region.localeCompare(b.region);
  }

  return order;
};
searchResultTypeRegistry.register({
  id: 'serverGroups',
  columns: [
  ],
  displayName: 'Server Groups',
  order: 6,
  icon: 'th-large',
  itemKeyFn: itemKeyFn,
  itemSortFn: itemSortFn,

  displayFormatter(searchResult: IServerGroupSearchResult): IPromise<string> {
    return $q.when(searchResult.serverGroup + ' (' + searchResult.region + ')');
  },
  renderers: {
    SearchResultTab: ({ ...props }) => (
      <SearchResultTab {...props} iconClass="fa fa-exchange" label="Security Groups" />
    ),

    SearchResultsHeader: () => (
      <TableHeader>
        <HeaderCell col={cols.SERVERGROUP}/>
        <HeaderCell col={cols.ACCOUNT}/>
        <HeaderCell col={cols.REGION}/>
        <HeaderCell col={cols.EMAIL}/>
      </TableHeader>
    ),

    SearchResultsData: ({ results }) => (
      <TableBody>
        {results.map(item => (
          <TableRow key={itemKeyFn(item)}>
            <HrefCell item={item} col={cols.SERVERGROUP} />
            <AccountCell item={item} col={cols.ACCOUNT} />
            <BasicCell item={item} col={cols.REGION} />
            <BasicCell item={item} col={cols.EMAIL} />
          </TableRow>
        ))}
      </TableBody>
    )
  }
});
