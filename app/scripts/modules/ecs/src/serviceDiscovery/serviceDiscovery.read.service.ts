import { module } from 'angular';

import { API } from '@spinnaker/core';
import { IServiceDiscoveryRegistryDescriptor } from './IServiceDiscovery';

export class ServiceDiscoveryReader {
  public listServiceDiscoveryRegistries(): ng.IPromise<IServiceDiscoveryRegistryDescriptor[]> {
    return API.all('ecs')
      .all('serviceDiscoveryRegistries')
      .getList();
  }
}

export const ECS_SERVICE_DISCOVERY_READ_SERVICE = 'spinnaker.ecs.servicediscovery.read.service';

module(ECS_SERVICE_DISCOVERY_READ_SERVICE, []).service('serviceDiscoveryReader', ServiceDiscoveryReader);
