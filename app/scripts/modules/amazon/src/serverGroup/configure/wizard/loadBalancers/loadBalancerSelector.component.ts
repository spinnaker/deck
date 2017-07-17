import { IComponentController, IComponentOptions, module } from 'angular';

import { INFRASTRUCTURE_CACHE_SERVICE, InfrastructureCacheService } from '@spinnaker/core';

import { AWS_SERVER_GROUP_CONFIGURATION_SERVICE, AwsServerGroupConfigurationService } from 'amazon/serverGroup/configure/serverGroupConfiguration.service';

class LoadBalancerSelectorController implements IComponentController {
  public command: any;

  public refreshTime: number;
  public refreshing = false;

  constructor(private awsServerGroupConfigurationService: AwsServerGroupConfigurationService,
              private infrastructureCaches: InfrastructureCacheService) {
    'ngInject';

    this.setLoadBalancerRefreshTime();
}

  public setLoadBalancerRefreshTime(): void {
    this.refreshTime = this.infrastructureCaches.get('loadBalancers').getStats().ageMax;
  }

  public refreshLoadBalancers(): void {
    this.refreshing = true;
    this.awsServerGroupConfigurationService.refreshLoadBalancers(this.command).then(() => {
      this.refreshing = false;
      this.setLoadBalancerRefreshTime();
    });
  }

  // Satisfy TypeScript 2.4 breaking change: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#weak-type-detection
  public $onInit() {}
}

export class LoadBalancerSelectorComponent implements IComponentOptions {
  public bindings: any = {
    command: '='
  };
  public controller: any = LoadBalancerSelectorController;
  public templateUrl = require('./loadBalancerSelector.component.html');
}

export const LOAD_BALANCER_SELECTOR = 'spinnaker.amazon.serverGroup.configure.wizard.loadBalancers.selector.component';
module (LOAD_BALANCER_SELECTOR, [
  AWS_SERVER_GROUP_CONFIGURATION_SERVICE,
  INFRASTRUCTURE_CACHE_SERVICE
])
  .component('awsServerGroupLoadBalancerSelector', new LoadBalancerSelectorComponent());
