import {module} from 'angular';
import LoDashStatic = _.LoDashStatic;

export class GceLoadBalancerSetTransformer {

  static get $inject() { return ['_', 'elSevenUtils']; }

  constructor(private _: LoDashStatic, private elSevenUtils: any) {}

  public normalizeLoadBalancerSet = (loadBalancers: any[]): any[] => {
    let [elSevenLoadBalancers, otherLoadBalancers] = this._.partition(loadBalancers, this.elSevenUtils.isElSeven);

    let groupedByUrlMap = this._.groupBy(elSevenLoadBalancers, 'urlMapName');
    let normalizedElSevenLoadBalancers = this._.map(groupedByUrlMap, this.normalizeElSevenGroup);

    return normalizedElSevenLoadBalancers.concat(otherLoadBalancers);
  };

  private normalizeElSevenGroup = (group: any[]): any[] => {
    let normalized = this._.cloneDeep(group[0]);

    normalized.listeners = group.map((loadBalancer) => {
      return {
        port: this.parsePortRange(loadBalancer.portRange),
        name: loadBalancer.name,
        certificate: loadBalancer.certificate,
      };
    });

    normalized.name = normalized.urlMapName;
    return normalized;
  };

  private parsePortRange = (portRange: string): string => {
    return portRange.split('-')[0];
  };
}

const moduleName = 'spinnaker.gce.loadBalancer.setTransformer.service';

module(moduleName, [
    require('../../core/utils/lodash.js'),
    require('./elSevenUtils.service.js'),
  ])
  .service('gceLoadBalancerSetTransformer', GceLoadBalancerSetTransformer);

export default moduleName;
