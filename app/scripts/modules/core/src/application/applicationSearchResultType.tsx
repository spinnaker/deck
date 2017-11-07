import { IPromise } from 'angular';
import { $q } from 'ngimport';

import {
  AccountCellRenderer, DefaultCellRenderer, HrefCellRenderer, searchResultTypeRegistry, ISearchResult,
  DefaultSearchResultsRenderer
} from 'core/search';

export interface IApplicationSearchResult extends ISearchResult {
  application: string;
}

searchResultTypeRegistry.register({
  id: 'applications',
  displayName: 'Applications',
  columns: [
    { key: 'application', label: 'Name', cellRenderer: HrefCellRenderer },
    { key: 'accounts', label: 'Account', cellRenderer: AccountCellRenderer },
    { key: 'email', label: 'Owner Email', cellRenderer: DefaultCellRenderer }
  ],
  order: 1,
  icon: 'window-maximize',
  itemKeyFn: (item: IApplicationSearchResult) => item.application,
  itemSortFn: (a: IApplicationSearchResult, b: IApplicationSearchResult) => a.application.localeCompare(b.application),
  displayFormatter(searchResult: IApplicationSearchResult): IPromise<string> {
    return $q.when(searchResult.application);
  },
  SearchResultsRenderer: DefaultSearchResultsRenderer,
});
