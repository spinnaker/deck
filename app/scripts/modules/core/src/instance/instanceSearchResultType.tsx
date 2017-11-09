import { IPromise } from 'angular';
import * as React from 'react';
import { $q } from 'ngimport';

import { SearchFilterTypeRegistry } from 'core/search/widgets/SearchFilterTypeRegistry';
import {
  AccountCell, BasicCell, HrefCell, searchResultTypeRegistry,
  ISearchResult
} from 'core/search';
import { SearchResultTab } from 'core/search/searchResult/SearchResultTab';
import { HeaderCell, TableBody, TableHeader, TableRow } from 'core';

export interface IInstanceSearchResult extends ISearchResult {
  account: string;
  application: string;
  cluster: string;
  displayName: string;
  href: string;
  instanceId: string;
  provider: string;
  region: string;
  serverGroup: string;
  type: string;
}

const cols = {
  INSTANCE: { key: 'instanceId', label: 'Instance ID', cellRenderer: HrefCell },
  ACCOUNTS: { key: 'accounts', cellRenderer: AccountCell },
  REGION: { key: 'region', cellRenderer: BasicCell },
  SERVERGROUP: { key: 'serverGroup', label: 'Server Group', defaultValue: 'Standalone Instance', cellRenderer: BasicCell }
};

const itemKeyFn = (item: IInstanceSearchResult) => item.instanceId;
const itemSortFn = (a: IInstanceSearchResult, b: IInstanceSearchResult) =>
  a.instanceId.localeCompare(b.instanceId);

searchResultTypeRegistry.register({
  id: 'instances',
  columns: [
  ],
  displayName: 'Instances',
  order: 4,
  icon: 'hdd-o',
  itemKeyFn: itemKeyFn,
  itemSortFn: itemSortFn,
  requiredSearchFields: [SearchFilterTypeRegistry.KEYWORD_FILTER.key],

  displayFormatter(searchResult: IInstanceSearchResult): IPromise<string> {
    const serverGroup = searchResult.serverGroup || 'standalone instance';
    return $q.when(searchResult.instanceId + ' (' + serverGroup + ' - ' + searchResult.region + ')');
  },
  renderers: {
    SearchResultTab: ({ ...props }) => (
      <SearchResultTab {...props} iconClass="fa fa-hdd-o" label="Instances" />
    ),

    SearchResultsHeader: () => (
      <TableHeader>
        <HeaderCell col={cols.INSTANCE}/>
        <HeaderCell col={cols.ACCOUNTS}/>
        <HeaderCell col={cols.REGION}/>
        <HeaderCell col={cols.SERVERGROUP}/>
      </TableHeader>
    ),

    SearchResultsData: ({ results }) => (
      <TableBody>
        {results.map(item => (
          <TableRow key={itemKeyFn(item)}>
            <HrefCell item={item} col={cols.INSTANCE} />
            <AccountCell item={item} col={cols.ACCOUNTS} />
            <BasicCell item={item} col={cols.REGION} />
            <BasicCell item={item} col={cols.SERVERGROUP} defaultValue="Standalone Instance" />
          </TableRow>
        ))}
      </TableBody>
    )
  }

});
