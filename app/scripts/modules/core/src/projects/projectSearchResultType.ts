import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, searchResultTypeRegistry } from '../search';
import { DefaultCellRenderer, DefaultSearchResultsRenderer, HrefCellRenderer } from 'core';

export interface IProjectSearchResult extends ISearchResult {
  id?: string;
  name?: string;
  project?: string;
  config?: { applications: string[] }
}

searchResultTypeRegistry.register({
  id: 'projects',
  columns: [
    { key: 'name', cellRenderer: HrefCellRenderer },
    { key: 'email', cellRenderer: DefaultCellRenderer }
  ],
  displayName: 'Projects',
  order: 0,
  icon: 'folder-o',
  itemKeyFn: (item: IProjectSearchResult) => item.id,
  itemSortFn: (a, b) => a.name.localeCompare(b.name),

  displayFormatter(searchResult: IProjectSearchResult): IPromise<string> {
    const applications = searchResult.config && searchResult.config.applications ?
      ' (' + searchResult.config.applications.join(', ') + ')' :
      '';
    const project = searchResult.name || searchResult.project;
    return $q.when(project + applications);
  },
  SearchResultsRenderer: DefaultSearchResultsRenderer,
});
