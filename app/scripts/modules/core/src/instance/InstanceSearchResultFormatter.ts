import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { SearchFilterTypeRegistry } from 'core/search/widgets/SearchFilterTypeRegistry';
import { ISearchResult, searchResultTypeRegistry } from '../search';
import { InstanceDisplayRenderer } from './InstanceDisplayRenderer';

export interface IInstanceSearchResult extends ISearchResult {
  serverGroup?: string;
  instanceId: string;
  region: string;
}

searchResultTypeRegistry.register({
  id: 'instances',
  displayName: 'Instances',
  order: 4,
  icon: 'hdd-o',
  displayRenderer: InstanceDisplayRenderer.renderer(),
  requiredSearchFields: [SearchFilterTypeRegistry.KEYWORD_FILTER.key],

  displayFormatter(searchResult: IInstanceSearchResult): IPromise<string> {
    const serverGroup = searchResult.serverGroup || 'standalone instance';
    return $q.when(searchResult.instanceId + ' (' + serverGroup + ' - ' + searchResult.region + ')');
  }
});
