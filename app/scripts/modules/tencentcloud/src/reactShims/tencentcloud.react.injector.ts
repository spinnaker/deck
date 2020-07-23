import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { TencentcloudLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

export class TencentcloudReactInject extends ReactInject {
  public get tencentcloudLoadBalancerTransformer() {
    return this.$injector.get('tencentcloudLoadBalancerTransformer') as TencentcloudLoadBalancerTransformer;
  }
  public initialize($injector: IInjectorService) {
    this.$injector = $injector;
  }
}

export const TencentcloudReactInjector: TencentcloudReactInject = new TencentcloudReactInject();
