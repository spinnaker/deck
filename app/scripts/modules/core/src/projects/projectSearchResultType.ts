import { IPromise } from 'angular';
import { $q } from 'ngimport';

import {
  searchResultTypeRegistry, BasicCellRenderer, DefaultSearchResultsRenderer, HrefCellRenderer, ISearchResult
} from 'core/search';
import { IProjectConfig } from 'core';

export interface IProjectSearchResult extends ISearchResult {
  applications: string[];
  clusters: string[];
  config: IProjectConfig;
  createTs: number;
  displayName: string;
  email: string;
  href: string;
  id: string;
  lastModifiedBy: string;
  name?: string;
  pipelineConfigId: string;
  project?: string;
  type: string;
  updateTs: number;
  url: string;
}

searchResultTypeRegistry.register({
  id: 'projects',
  columns: [
    { key: 'name', cellRenderer: HrefCellRenderer },
    { key: 'email', cellRenderer: BasicCellRenderer }
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
