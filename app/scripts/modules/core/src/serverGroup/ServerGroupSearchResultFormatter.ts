import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, ISearchResultType, searchResultFormatterRegistry } from '../search';
import { ServerGroupDisplayRenderer } from './ServerGroupDisplayRenderer';

export interface IServerGroupSearchResult extends ISearchResult {
  serverGroup: string;
  region: string;
}

export class ServerGroupSearchResultFormatter implements ISearchResultType {
  public id = 'serverGroups';
  public displayName = 'Server Groups';
  public order = 6;
  public icon = 'th-large';
  public displayRenderer = ServerGroupDisplayRenderer.renderer();

  public displayFormatter(searchResult: IServerGroupSearchResult): IPromise<string> {
    return $q.when(searchResult.serverGroup + ' (' + searchResult.region + ')');
  }
}

searchResultFormatterRegistry.register(new ServerGroupSearchResultFormatter());
