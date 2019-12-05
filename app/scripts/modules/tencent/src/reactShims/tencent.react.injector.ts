import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { TencentServerGroupConfigurationService } from '../serverGroup/configure/serverGroupConfiguration.service';
import { TencentServerGroupTransformer } from '../serverGroup/serverGroup.transformer';
import { TencentLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

// prettier-ignore
export class TencentReactInject extends ReactInject {
  public get tencentInstanceTypeService() { return this.$injector.get('tencentInstanceTypeService') as any; }
  public get tencentLoadBalancerTransformer() { return this.$injector.get('tencentLoadBalancerTransformer') as TencentLoadBalancerTransformer; }
  public get tencentServerGroupCommandBuilder() { return this.$injector.get('tencentServerGroupCommandBuilder') as any; }
  public get tencentServerGroupConfigurationService() { return this.$injector.get('tencentServerGroupConfigurationService') as TencentServerGroupConfigurationService; }
  public get tencentServerGroupTransformer() { return this.$injector.get('tencentServerGroupTransformer') as TencentServerGroupTransformer; }

  public initialize($injector: IInjectorService) {
    this.$injector = $injector;
  }
}

export const TencentReactInjector: TencentReactInject = new TencentReactInject();
