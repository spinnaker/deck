import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, ISearchResultType, searchResultFormatterRegistry } from '../search';
import { ProjectDisplayRenderer } from './ProjectDisplayRenderer';

export interface IProjectSearchResult extends ISearchResult {
  name?: string;
  project?: string;
  config?: { applications: string[] }
}

export class ProjectSearchResultFormatter implements ISearchResultType {
  public id = 'projects';
  public displayName = 'Projects';
  public order = 0;
  public icon = 'folder-o';
  public displayRenderer = ProjectDisplayRenderer.renderer();

  public displayFormatter(searchResult: IProjectSearchResult): IPromise<string> {
    const applications = searchResult.config && searchResult.config.applications ?
      ' (' + searchResult.config.applications.join(', ') + ')' :
      '';
    const project = searchResult.name || searchResult.project;
    return $q.when(project + applications);
  }

}

searchResultFormatterRegistry.register('projects', new ProjectSearchResultFormatter());
