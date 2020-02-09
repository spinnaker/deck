import { module, IQService, IPromise } from 'angular';
import { chain, camelCase } from 'lodash';

import { IServerGroup, IInstanceCounts } from '@spinnaker/core';
import { IKubernetesAutoscaler } from './IKubernetesAutoscaler';

class KubernetesV2AutoscalerTransformer {
  public static $inject = ['$q'];
  constructor(private $q: IQService) {}

  public normalizeAutoscaler(autoscaler: IKubernetesAutoscaler): IPromise<IKubernetesAutoscaler> {
    autoscaler.instanceCounts = this.buildInstanceCounts(autoscaler.serverGroups);
    return this.$q.resolve(autoscaler);
  }

  private buildInstanceCounts(serverGroups: IServerGroup[]): IInstanceCounts {
    return chain(serverGroups)
      .map(({ instances }) => instances)
      .flatten()
      .reduce(
        (acc: IInstanceCounts, instance: any) => {
          acc[camelCase(instance.health.state) as keyof IInstanceCounts]++;
          return acc;
        },
        {
          up: 0,
          down: 0,
          outOfService: 0,
          succeeded: 0,
          failed: 0,
          unknown: 0,
          starting: 0,
        },
      )
      .value();
  }
}

export const KUBERNETES_V2_AUTOSCALER_TRANSFORMER = 'spinnaker.kubernetes.v2.autoscalerTransformer';
module(KUBERNETES_V2_AUTOSCALER_TRANSFORMER, []).service(
  'kubernetesV2AutoscalerTransformer',
  KubernetesV2AutoscalerTransformer,
);
