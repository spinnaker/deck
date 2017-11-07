import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ILoadBalancerSearchResult, searchResultTypeRegistry } from '../search';
import { AccountCellRenderer, DefaultCellRenderer, DefaultSearchResultsRenderer, HrefCellRenderer } from 'core';


const loadBalancerSort = (a: ILoadBalancerSearchResult, b: ILoadBalancerSearchResult) => {
  const order: number = a.loadBalancer.localeCompare(b.loadBalancer);
  return order !== 0 ? order : a.region.localeCompare(b.region);
};

searchResultTypeRegistry.register({
  id: 'loadBalancers',
  columns: [
    { key: 'loadBalancer', label: 'Name', cellRenderer: HrefCellRenderer },
    { key: 'account', cellRenderer: AccountCellRenderer },
    { key: 'region', cellRenderer: DefaultCellRenderer },
    { key: 'loadBalancerType', label: 'Type', cellRenderer: DefaultCellRenderer }
  ],
  displayName: 'Load Balancers',
  icon: 'sitemap',
  itemKeyFn: (item: ILoadBalancerSearchResult) => [item.loadBalancer, item.account, item.region].join('|'),
  itemSortFn: loadBalancerSort,
  order: 5,

  displayFormatter(searchResult: ILoadBalancerSearchResult, fromRoute: boolean): IPromise<string> {
    const name = fromRoute ? (searchResult as any).name : searchResult.loadBalancer;
    return $q.when(name + ' (' + searchResult.region + ')');
  },
  SearchResultsRenderer: DefaultSearchResultsRenderer,
});
