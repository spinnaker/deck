import { IQService, IPromise } from 'angular';
import { IEcsLoadBalancerSourceData, IEcsLoadBalancer, IEcsTargetGroup } from '../domain/IEcsLoadBalancer';

export class EcsLoadBalancerTransformer {
  public static $inject = ['$q'];
  constructor(private $q: IQService) {}

  public normalizeLoadBalancer(loadBalancer: IEcsLoadBalancerSourceData): IPromise<IEcsLoadBalancer> {
    loadBalancer.targetGroups.forEach((tg: IEcsTargetGroup) => {
      tg.region = loadBalancer.region;
      tg.account = loadBalancer.account;
      tg.cloudProvider = loadBalancer.cloudProvider;
      if (loadBalancer.targetGroupServices) {
        const tgServiceMap = loadBalancer.targetGroupServices;
        tg.serverGroups = tgServiceMap[tg.targetGroupArn];
      }
    });
    return this.$q.resolve(loadBalancer);
  }
}
