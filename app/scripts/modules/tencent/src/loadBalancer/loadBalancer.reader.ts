import { IPromise } from 'angular';

import { API } from '@spinnaker/core';

export interface ITencentLoadBalancer {
  accounts: string;
  id: string;
  name: string;
  region: string;
  type: string;
  vpcId: string;
}

export class LoadBalancerReader {
  public static findLoadBalancer(params: {
    account: string;
    region: string;
    loadBalancerId: string;
  }): IPromise<ITencentLoadBalancer[]> {
    return API.one('loadBalancers')
      .withParams({ ...params, provider: 'tencent' })
      .get()
      .catch(() => [] as ITencentLoadBalancer[]);
  }

  public static getLoadBalancers(): IPromise<ITencentLoadBalancer> {
    return API.one('loadBalancers')
      .withParams({ provider: 'tencent' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => [] as ITencentLoadBalancer[]);
  }
}
