import { IPromise } from 'angular';
import { $q } from 'ngimport';
import { flatten } from 'lodash';

import { AccountService, Application, ILoadBalancer } from '@spinnaker/core';

import { ITencentApplicationLoadBalancer, ITencentHealth, ITencentServerGroup, ITargetGroup } from 'tencent/domain';

export class TencentLoadBalancerDataUtils {
  private static buildTargetGroup(match: ITargetGroup, serverGroup: ITencentServerGroup): ITargetGroup {
    if (!match) {
      return null;
    }

    const targetGroup: ITargetGroup = {
      name: match.name,
      vpcId: match.vpcId,
      cloudProvider: match.cloudProvider,
      account: match.account,
      region: match.region,
      loadBalancerNames: match.loadBalancerNames,
    } as ITargetGroup;
    targetGroup.instanceCounts = { up: 0, down: 0, succeeded: 0, failed: 0, outOfService: 0, unknown: 0, starting: 0 };

    serverGroup.instances.forEach(instance => {
      const tgHealth: ITencentHealth = instance.health.find(h => h.type === 'TargetGroup') as ITencentHealth;
      if (tgHealth) {
        const matchedHealth: ILoadBalancer = tgHealth.targetGroups.find(
          tg => tg.name === match.name && tg.region === match.region && tg.account === match.account,
        );

        if (matchedHealth !== undefined && matchedHealth.healthState !== undefined) {
          const healthState = matchedHealth.healthState.toLowerCase();
          if (targetGroup.instanceCounts[healthState] !== undefined) {
            targetGroup.instanceCounts[healthState]++;
          }
        }
      }
    });
    return targetGroup;
  }

  public static populateTargetGroups(
    application: Application,
    serverGroup: ITencentServerGroup,
  ): IPromise<ITargetGroup[]> {
    return $q
      .all([AccountService.getAccountDetails(serverGroup.account), application.getDataSource('loadBalancers').ready()])
      .then(data => {
        const tencentAccount = (data[0] && data[0].awsAccount) || serverGroup.account;
        const loadBalancers: ITencentApplicationLoadBalancer[] = application
          .getDataSource('loadBalancers')
          .data.filter(
            (lb: any) => lb.loadBalancerType === 'application' || lb.loadBalancerType === 'network',
          ) as ITencentApplicationLoadBalancer[];
        const targetGroups = serverGroup.targetGroups
          ? serverGroup.targetGroups
              .map((targetGroupName: string) => {
                const allTargetGroups = flatten(loadBalancers.map(lb => lb.targetGroups || []));
                const targetGroup = allTargetGroups.find(
                  tg =>
                    tg.name === targetGroupName && tg.region === serverGroup.region && tg.account === tencentAccount,
                );
                return this.buildTargetGroup(targetGroup, serverGroup);
              })
              .filter(tg => tg)
          : [];
        return targetGroups;
      });
  }
}
