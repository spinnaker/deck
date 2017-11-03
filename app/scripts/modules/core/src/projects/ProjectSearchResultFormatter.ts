import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, searchResultFormatterRegistry } from '../search';
import { ProjectDisplayRenderer } from './ProjectDisplayRenderer';

export interface IProjectSearchResult extends ISearchResult {
  name?: string;
  project?: string;
  config?: { applications: string[] }
}

searchResultFormatterRegistry.register({
  id: 'projects',
  displayName: 'Projects',
  order: 0,
  icon: 'folder-o',
  displayRenderer: ProjectDisplayRenderer.renderer(),

  displayFormatter(searchResult: IProjectSearchResult): IPromise<string> {
    const applications = searchResult.config && searchResult.config.applications ?
      ' (' + searchResult.config.applications.join(', ') + ')' :
      '';
    const project = searchResult.name || searchResult.project;
    return $q.when(project + applications);
  }
});
