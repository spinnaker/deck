import { IPromise, IQService, module } from 'angular';

import { API_SERVICE, Api } from 'core/api/api.service';
import { IComponentName, NameUtils } from 'core/naming';
import { ILoadBalancer, ILoadBalancerSourceData } from 'core/domain';

export interface ILoadBalancersByAccount {
  name: string;
  accounts: Array<{
    name: string;
    regions: Array<{
      name: string;
      loadBalancers: ILoadBalancerSourceData[];
    }>;
  }>;
}

export class LoadBalancerReader {
  public constructor(private $q: IQService, private API: Api, private loadBalancerTransformer: any) {
    'ngInject';
  }

  public loadLoadBalancers(applicationName: string): IPromise<ILoadBalancerSourceData[]> {
    return this.API.one('applications', applicationName)
      .all('loadBalancers')
      .getList()
      .then((loadBalancers: ILoadBalancerSourceData[]) => {
        loadBalancers = this.loadBalancerTransformer.normalizeLoadBalancerSet(loadBalancers);
        return this.$q.all(loadBalancers.map(lb => this.normalizeLoadBalancer(lb)));
      });
  }

  public getLoadBalancerDetails(
    cloudProvider: string,
    account: string,
    region: string,
    name: string,
  ): IPromise<ILoadBalancerSourceData[]> {
    return this.API.all('loadBalancers')
      .all(account)
      .all(region)
      .all(name)
      .withParams({ provider: cloudProvider })
      .get();
  }

  public listLoadBalancers(cloudProvider: string): IPromise<ILoadBalancersByAccount[]> {
    return this.API.all('loadBalancers')
      .withParams({ provider: cloudProvider })
      .getList();
  }

  private normalizeLoadBalancer(loadBalancer: ILoadBalancerSourceData): IPromise<ILoadBalancer> {
    return this.loadBalancerTransformer.normalizeLoadBalancer(loadBalancer).then((lb: ILoadBalancer) => {
      const nameParts: IComponentName = NameUtils.parseLoadBalancerName(lb.name);
      lb.stack = nameParts.stack;
      lb.detail = nameParts.freeFormDetails;
      lb.cloudProvider = lb.cloudProvider || lb.type || lb.provider;
      lb.loadBalancerType = lb.loadBalancerType || 'classic';
      return lb;
    });
  }
}

export const LOAD_BALANCER_READ_SERVICE = 'spinnaker.core.loadBalancer.read.service';

module(LOAD_BALANCER_READ_SERVICE, [require('./loadBalancer.transformer.js').name, API_SERVICE]).service(
  'loadBalancerReader',
  LoadBalancerReader,
);
