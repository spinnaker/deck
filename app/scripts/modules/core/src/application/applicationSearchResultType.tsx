import { IPromise } from 'angular';
import { $q } from 'ngimport';

import {
  AccountCellRenderer, BasicCellRenderer, HrefCellRenderer, searchResultTypeRegistry, ISearchResult,
  DefaultSearchResultsRenderer
} from 'core/search';

export interface IApplicationSearchResult extends ISearchResult {
  accounts: string[];
  application: string;
  cloudProviders: string;
  createTs: string;
  description: string;
  email: string;
  group: string;
  lastModifiedBy: string;
  legacyUdf: boolean;
  name: string;
  owner: string;
  pdApiKey: string;
  updateTs: string;
  url: string;
  user: string;
}


searchResultTypeRegistry.register({
  id: 'applications',
  displayName: 'Applications',
  columns: [
    { key: 'application', label: 'Name', cellRenderer: HrefCellRenderer },
    { key: 'accounts', label: 'Account', cellRenderer: AccountCellRenderer },
    { key: 'email', label: 'Owner Email', cellRenderer: BasicCellRenderer }
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
