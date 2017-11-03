import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, searchResultFormatterRegistry } from '../search';
import { ApplicationDisplayRenderer } from './ApplicationDisplayRenderer';

export interface IApplicationSearchResult extends ISearchResult {
  application: string;
}

searchResultFormatterRegistry.register({
  id: 'applications',
  displayName: 'Applications',
  order: 1,
  icon: 'window-maximize',
  displayRenderer: ApplicationDisplayRenderer.renderer(),
  displayFormatter(searchResult: IApplicationSearchResult): IPromise<string> {
    return $q.when(searchResult.application);
  }
});
