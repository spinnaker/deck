import * as React from 'react';

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

const iconClass = 'fa fa-th-large';
const displayName = 'Security Groups';

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
  order: 6,
  iconClass,
  displayName,
  displayFormatter: (searchResult: IServerGroupSearchResult) => `${searchResult.serverGroup} (${searchResult.region})`,
  components: {
    SearchResultTab: ({ ...props }) => (
      <SearchResultTab {...props} iconClass={iconClass} label={displayName} />
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
        {results.slice().sort(itemSortFn).map(item => (
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
