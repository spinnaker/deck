import { IPromise } from 'angular';
import * as React from 'react';
import { $q } from 'ngimport';

import {
  AccountCell, BasicCell, HrefCell, searchResultTypeRegistry,
  ISearchResult, HeaderCell, TableBody, TableHeader, TableRow,
} from 'core/search';
import { SearchResultTab } from 'core/search/searchResult/SearchResultTab';

export interface ISecurityGroupSearchResult extends ISearchResult {
  account: string;
  application: string;
  href: string;
  id: string;
  name: string;
  provider: string;
  region: string;
  type: string;
  url: string;
  vpcId: string;
}

const cols = {
  NAME: { key: 'name', cellRenderer: HrefCell },
  ACCOUNT: { key: 'account', cellRenderer: AccountCell },
  REGION: { key: 'region', cellRenderer: BasicCell }
};

const iconClass = 'fa fa-exchange';
const displayName = 'Security Groups';

const itemKeyFn = (item: ISecurityGroupSearchResult) =>
  [item.id, item.name, item.account, item.region].join('|');
const itemSortFn = (a: ISecurityGroupSearchResult, b: ISecurityGroupSearchResult) => {
  let order: number = a.name.localeCompare(b.name);
  if (order === 0) {
    order = a.region.localeCompare(b.region);
  }

  return order;
};

searchResultTypeRegistry.register({
  id: 'securityGroups',
  iconClass,
  displayName,
  order: 6,

  displayFormatter(searchResult: ISecurityGroupSearchResult): IPromise<string> {
    return $q.when(searchResult.name + ' (' + searchResult.region + ')');
  },
  renderers: {
    SearchResultTab: ({ ...props }) => (
      <SearchResultTab {...props} iconClass={iconClass} label={displayName} />
    ),

    SearchResultsHeader: () => (
      <TableHeader>
        <HeaderCell col={cols.NAME}/>
        <HeaderCell col={cols.ACCOUNT}/>
        <HeaderCell col={cols.REGION}/>
      </TableHeader>
    ),

    SearchResultsData: ({ results }) => (
      <TableBody>
        {results.slice().sort(itemSortFn).map(item => (
          <TableRow key={itemKeyFn(item)}>
            <HrefCell item={item} col={cols.NAME} />
            <AccountCell item={item} col={cols.ACCOUNT} />
            <BasicCell item={item} col={cols.REGION} />
          </TableRow>
        ))}
      </TableBody>
    )
  }
});
