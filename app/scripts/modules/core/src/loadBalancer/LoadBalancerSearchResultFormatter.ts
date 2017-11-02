import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, ISearchResultType, searchResultFormatterRegistry } from '../search';
import { LoadBalancerDisplayRenderer } from './LoadBalancerDisplayRenderer';

export interface ILoadBalancerSearchResult extends ISearchResult {
  name?: string;
  loadBalancer: string;
  region: string;
}

export class LoadBalancerSearchResultFormatter implements ISearchResultType {
  public id = 'loadBalancers';
  public displayName = 'Load Balancers';
  public order = 5;
  public icon = 'sitemap';
  public displayRenderer = LoadBalancerDisplayRenderer.renderer();

  public displayFormatter(searchResult: ILoadBalancerSearchResult, fromRoute: boolean): IPromise<string> {
    const name = fromRoute ? searchResult.name : searchResult.loadBalancer;
    return $q.when(name + ' (' + searchResult.region + ')');
  }
}

searchResultFormatterRegistry.register('loadBalancers', new LoadBalancerSearchResultFormatter());
