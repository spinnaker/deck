import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { ISearchResult, searchResultTypeRegistry } from '../search';
import { LoadBalancerDisplayRenderer } from './LoadBalancerDisplayRenderer';

export interface ILoadBalancerSearchResult extends ISearchResult {
  name?: string;
  loadBalancer: string;
  region: string;
}

searchResultTypeRegistry.register({
  id: 'loadBalancers',
  displayName: 'Load Balancers',
  order: 5,
  icon: 'sitemap',
  displayRenderer: LoadBalancerDisplayRenderer.renderer(),

  displayFormatter(searchResult: ILoadBalancerSearchResult, fromRoute: boolean): IPromise<string> {
    const name = fromRoute ? searchResult.name : searchResult.loadBalancer;
    return $q.when(name + ' (' + searchResult.region + ')');
  }
});
