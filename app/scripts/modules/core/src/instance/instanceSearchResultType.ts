import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { SearchFilterTypeRegistry } from 'core/search/widgets/SearchFilterTypeRegistry';
import {
  AccountCellRenderer, DefaultCellRenderer, HrefCellRenderer, ValueOrDefaultCellRenderer, ISearchResult,
  searchResultTypeRegistry
} from 'core/search';
import { DefaultSearchResultsRenderer } from 'core';

export interface IInstanceSearchResult extends ISearchResult {
  serverGroup?: string;
  instanceId: string;
  region: string;
}

searchResultTypeRegistry.register({
  id: 'instances',
  columns: [
    { key: 'instanceId', label: 'Instance ID', cellRenderer: HrefCellRenderer },
    { key: 'account', cellRenderer: AccountCellRenderer },
    { key: 'region', cellRenderer: DefaultCellRenderer },
    { key: 'serverGroup', label: 'Server Group', defaultValue: 'Standalone Instance', cellRenderer: ValueOrDefaultCellRenderer }
  ],
  displayName: 'Instances',
  order: 4,
  icon: 'hdd-o',
  itemKeyFn: (item: IInstanceSearchResult) => item.instanceId,
  itemSortFn: (a, b) => a.instanceId.localeCompare(b.instanceId),
  requiredSearchFields: [SearchFilterTypeRegistry.KEYWORD_FILTER.key],

  displayFormatter(searchResult: IInstanceSearchResult): IPromise<string> {
    const serverGroup = searchResult.serverGroup || 'standalone instance';
    return $q.when(searchResult.instanceId + ' (' + serverGroup + ' - ' + searchResult.region + ')');
  },
  SearchResultsRenderer: DefaultSearchResultsRenderer,
});
