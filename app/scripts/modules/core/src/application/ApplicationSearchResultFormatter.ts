import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, ISearchResultType, searchResultFormatterRegistry } from '../search';
import { ApplicationDisplayRenderer } from './ApplicationDisplayRenderer';

export interface IApplicationSearchResult extends ISearchResult {
  application: string;
}

export class ApplicationSearchResultFormatter implements ISearchResultType {
  public id = 'applications';
  public displayName = 'Applications';
  public order = 1;
  public icon = 'window-maximize';
  public displayRenderer = ApplicationDisplayRenderer.renderer();
  public displayFormatter(searchResult: IApplicationSearchResult): IPromise<string> {
    return $q.when(searchResult.application);
  }
}

searchResultFormatterRegistry.register(new ApplicationSearchResultFormatter());
