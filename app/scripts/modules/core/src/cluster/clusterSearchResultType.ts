import { IPromise } from 'angular';

import { $q } from 'ngimport';

import {
  ISearchResult, searchResultTypeRegistry, DefaultSearchResultsRenderer , AccountCellRenderer, DefaultCellRenderer, HrefCellRenderer
} from 'core/search';

export interface IClusterSearchResult extends ISearchResult {
  cluster: string;
}

searchResultTypeRegistry.register({
  id: 'clusters',
  columns: [
    { key: 'cluster', label: 'Name', cellRenderer: HrefCellRenderer },
    { key: 'account', cellRenderer: AccountCellRenderer },
    { key: 'email', cellRenderer: DefaultCellRenderer }
  ],
  displayName: 'Clusters',
  order: 2,
  icon: 'th',
  itemKeyFn: (item: IClusterSearchResult) => item.cluster,
  itemSortFn: (a, b) => a.cluster.localeCompare(b.cluster),
  displayFormatter(searchResult: IClusterSearchResult): IPromise<string> {
    return $q.when(searchResult.cluster);
  },
  SearchResultsRenderer: DefaultSearchResultsRenderer,
});
