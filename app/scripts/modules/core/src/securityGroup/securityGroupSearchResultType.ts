import { IPromise } from 'angular';

import { $q } from 'ngimport';

import {
  AccountCellRenderer, DefaultCellRenderer, DefaultSearchResultsRenderer, HrefCellRenderer, searchResultTypeRegistry,
  ISearchResult,
} from 'core/search';

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

const securityGroupSort = (a: ISecurityGroupSearchResult, b: ISecurityGroupSearchResult) => {
  let order: number = a.name.localeCompare(b.name);
  if (order === 0) {
    order = a.region.localeCompare(b.region);
  }

  return order;
};

searchResultTypeRegistry.register({
  id: 'securityGroups',
  columns: [
    { key: 'name', cellRenderer: HrefCellRenderer },
    { key: 'account', cellRenderer: AccountCellRenderer },
    { key: 'region', cellRenderer: DefaultCellRenderer }
  ],
  displayName: 'Security Groups',
  icon: 'exchange',
  itemKeyFn: (item: ISecurityGroupSearchResult) => [item.id, item.name, item.account, item.region].join('|'),
  itemSortFn: securityGroupSort,
  order: 6,

  displayFormatter(searchResult: ISecurityGroupSearchResult): IPromise<string> {
    return $q.when(searchResult.name + ' (' + searchResult.region + ')');
  },
  SearchResultsRenderer: DefaultSearchResultsRenderer,
});
