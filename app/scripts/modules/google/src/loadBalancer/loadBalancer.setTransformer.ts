import { module } from 'angular';
import { cloneDeep, groupBy, map, partition } from 'lodash';

import { GCE_HTTP_LOAD_BALANCER_UTILS, GceHttpLoadBalancerUtils } from 'google/loadBalancer/httpLoadBalancerUtils.service';
import { IGceLoadBalancer, IGceHttpLoadBalancer } from 'google/domain/loadBalancer';

export class GceLoadBalancerSetTransformer {

  private static normalizeHttpLoadBalancerGroup(group: IGceHttpLoadBalancer[]): IGceHttpLoadBalancer {
    const normalized = cloneDeep(group[0]);

    normalized.listeners = group.map((loadBalancer) => {
      const port = loadBalancer.portRange ? GceLoadBalancerSetTransformer.parsePortRange(loadBalancer.portRange) : null;
      return {
        port,
        name: loadBalancer.name,
        certificate: loadBalancer.certificate,
        ipAddress: loadBalancer.ipAddress
      };
    });

    normalized.name = normalized.urlMapName;
    return normalized;
  }

  private static parsePortRange (portRange: string): string {
    return portRange.split('-')[0];
  }

  constructor(private gceHttpLoadBalancerUtils: GceHttpLoadBalancerUtils) { 'ngInject'; }

  public normalizeLoadBalancerSet = (loadBalancers: IGceLoadBalancer[]): IGceLoadBalancer[] => {
    const [httpLoadBalancers, otherLoadBalancers] = partition(loadBalancers, lb => this.gceHttpLoadBalancerUtils.isHttpLoadBalancer(lb));

    const groupedByUrlMap = groupBy(httpLoadBalancers, 'urlMapName');
    const normalizedElSevenLoadBalancers = map(groupedByUrlMap, GceLoadBalancerSetTransformer.normalizeHttpLoadBalancerGroup);

    return (normalizedElSevenLoadBalancers as IGceLoadBalancer[]).concat(otherLoadBalancers);
  }
}

export const LOAD_BALANCER_SET_TRANSFORMER = 'spinnaker.gce.loadBalancer.setTransformer.service';
module(LOAD_BALANCER_SET_TRANSFORMER, [GCE_HTTP_LOAD_BALANCER_UTILS])
  .service('gceLoadBalancerSetTransformer', GceLoadBalancerSetTransformer);
