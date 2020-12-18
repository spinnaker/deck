import { module } from 'angular';

import { REST } from '@spinnaker/core';
import { IEcsClusterDescriptor } from './IEcsCluster';
import {IEcsDescribeCluster} from "./IEcsDescribeCluster";

export class EcsClusterReader {
  public listClusters(): PromiseLike<IEcsClusterDescriptor[]> {
    return REST('/ecs/ecsClusters').get();
  }

  public listDescribeClusters(account: string, region: string): PromiseLike<IEcsDescribeCluster[]> {
    if(account != null && region != null) {
      return REST('/ecs/ecsClusterDescriptions').path(account).path(region).get();
    }
    return null;
  }
}

export const ECS_CLUSTER_READ_SERVICE = 'spinnaker.ecs.ecsCluster.read.service';

module(ECS_CLUSTER_READ_SERVICE, []).service('ecsClusterReader', EcsClusterReader);
