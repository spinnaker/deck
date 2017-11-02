import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { SearchFilterTypeRegistry } from 'core/search/widgets/SearchFilterTypeRegistry';
import { ISearchResult, ISearchResultType, searchResultFormatterRegistry } from '../search';
import { InstanceDisplayRenderer } from './InstanceDisplayRenderer';

export interface IInstanceSearchResult extends ISearchResult {
  serverGroup?: string;
  instanceId: string;
  region: string;
}

export class InstanceSearchResultFormatter implements ISearchResultType {
  public id = 'instances';
  public displayName = 'Instances';
  public order = 4;
  public icon = 'hdd-o';
  public displayRenderer = InstanceDisplayRenderer.renderer();
  public requiredSearchFields = [SearchFilterTypeRegistry.KEYWORD_FILTER.key];

  public displayFormatter(searchResult: IInstanceSearchResult): IPromise<string> {
    const serverGroup = searchResult.serverGroup || 'standalone instance';
    return $q.when(searchResult.instanceId + ' (' + serverGroup + ' - ' + searchResult.region + ')');
  }
}

searchResultFormatterRegistry.register('instances', new InstanceSearchResultFormatter());
