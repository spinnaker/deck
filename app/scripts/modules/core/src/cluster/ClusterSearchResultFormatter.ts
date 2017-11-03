import { IPromise } from 'angular';

import { $q } from 'ngimport';

import { ISearchResult, searchResultFormatterRegistry } from '../search';
import { ClusterDisplayRenderer } from 'core/cluster/ClusterDisplayRenderer';

export interface IClusterSearchResult extends ISearchResult {
  cluster: string;
}

searchResultFormatterRegistry.register({
  id: 'clusters',
  displayName: 'Clusters',
  order: 2,
  icon: 'th',
  displayRenderer: ClusterDisplayRenderer.renderer(),
  displayFormatter(searchResult: IClusterSearchResult): IPromise<string> {
    return $q.when(searchResult.cluster);
  }
});
