import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { SearchFilterTypeRegistry } from 'core/search/widgets/SearchFilterTypeRegistry';
import {
  AccountCellRenderer, BasicCellRenderer, HrefCellRenderer, DefaultValueCellRenderer, searchResultTypeRegistry,
  DefaultSearchResultsRenderer, ISearchResult
} from 'core/search';

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


searchResultTypeRegistry.register({
  id: 'instances',
  columns: [
    { key: 'instanceId', label: 'Instance ID', cellRenderer: HrefCellRenderer },
    { key: 'account', cellRenderer: AccountCellRenderer },
    { key: 'region', cellRenderer: BasicCellRenderer },
    { key: 'serverGroup', label: 'Server Group', defaultValue: 'Standalone Instance', cellRenderer: DefaultValueCellRenderer }
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
