import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, searchResultTypeRegistry } from '../search';
import { AccountCellRenderer, DefaultCellRenderer, DefaultSearchResultsRenderer, HrefCellRenderer } from 'core';

export interface IServerGroupSearchResult extends ISearchResult {
  account: string;
  region: string;
  serverGroup: string;
}

const serverGroupSort = (a: IServerGroupSearchResult, b: IServerGroupSearchResult) => {
  let order: number = a.serverGroup.localeCompare(b.serverGroup);
  if (order === 0) {
    order = a.region.localeCompare(b.region);
  }

  return order;
};

searchResultTypeRegistry.register({
  id: 'serverGroups',
  columns: [
    { key: 'serverGroup', label: 'Name', cellRenderer: HrefCellRenderer },
    { key: 'account', cellRenderer: AccountCellRenderer },
    { key: 'region', cellRenderer: DefaultCellRenderer },
    { key: 'email', cellRenderer: DefaultCellRenderer }
  ],
  displayName: 'Server Groups',
  order: 6,
  icon: 'th-large',
  itemKeyFn: (item: IServerGroupSearchResult) => [item.serverGroup, item.account, item.region].join('|'),
  itemSortFn: serverGroupSort,

  displayFormatter(searchResult: IServerGroupSearchResult): IPromise<string> {
    return $q.when(searchResult.serverGroup + ' (' + searchResult.region + ')');
  },
  SearchResultsRenderer: DefaultSearchResultsRenderer,
});
