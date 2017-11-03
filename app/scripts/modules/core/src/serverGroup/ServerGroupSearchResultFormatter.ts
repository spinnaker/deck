import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, searchResultFormatterRegistry } from '../search';
import { ServerGroupDisplayRenderer } from './ServerGroupDisplayRenderer';

export interface IServerGroupSearchResult extends ISearchResult {
  serverGroup: string;
  region: string;
}

searchResultFormatterRegistry.register({
  id: 'serverGroups',
  displayName: 'Server Groups',
  order: 6,
  icon: 'th-large',
  displayRenderer: ServerGroupDisplayRenderer.renderer(),

  displayFormatter(searchResult: IServerGroupSearchResult): IPromise<string> {
    return $q.when(searchResult.serverGroup + ' (' + searchResult.region + ')');
  }
});
