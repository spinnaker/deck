import { IPromise } from 'angular';

import { $q } from 'ngimport';

import { ISearchResult, ISearchResultType, searchResultFormatterRegistry } from '../search';
import { ClusterDisplayRenderer } from 'core/cluster/ClusterDisplayRenderer';

export interface IClusterSearchResult extends ISearchResult {
  cluster: string;
}

export class ClusterSearchResultFormatter implements ISearchResultType {
  public id = 'clusters';
  public displayName = 'Clusters';
  public order = 2;
  public icon = 'th';
  public displayRenderer = ClusterDisplayRenderer.renderer();
  public displayFormatter(searchResult: IClusterSearchResult): IPromise<string> {
    return $q.when(searchResult.cluster);
  }
}

searchResultFormatterRegistry.register('clusters', new ClusterSearchResultFormatter());
