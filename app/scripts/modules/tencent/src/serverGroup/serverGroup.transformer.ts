import { module, IPromise } from 'angular';

import { IVpc } from '@spinnaker/core';

import {
  IScalingAdjustmentView,
  IScalingPolicyView,
  IScalingPolicyAlarmView,
  ITencentServerGroup,
  IScalingPolicy,
  ITencentServerGroupView,
} from '../domain';
import { VpcReader } from '../vpc/VpcReader';

export class TencentServerGroupTransformer {
  private addComparator(alarm: IScalingPolicyAlarmView): void {
    if (!alarm.comparisonOperator) {
      return;
    }
    switch (alarm.comparisonOperator) {
      case 'LESS_THAN':
        alarm.comparator = '&lt;';
        break;
      case 'GREATER_THAN':
        alarm.comparator = '&gt;';
        break;
      case 'LESS_THAN_OR_EQUAL_TO':
        alarm.comparator = '&le;';
        break;
      case 'GREATER_THAN_OR_EQUAL_TO':
        alarm.comparator = '&ge;';
        break;
    }
  }

  private addAdjustmentAttributes(policyOrStepAdjustment: IScalingAdjustmentView): void {
    policyOrStepAdjustment.operator = policyOrStepAdjustment.adjustmentValue < 0 ? 'decrease' : 'increase';
    policyOrStepAdjustment.absAdjustment = Math.abs(policyOrStepAdjustment.adjustmentValue);
  }

  public transformScalingPolicy(policy: IScalingPolicy): IScalingPolicyView {
    const view: IScalingPolicyView = { ...policy } as IScalingPolicyView;
    view.metricAlarm = policy.metricAlarm;
    this.addComparator(view.metricAlarm);
    this.addAdjustmentAttributes(view); // simple policies
    return view;
  }

  public normalizeServerGroupDetails(serverGroup: ITencentServerGroup): ITencentServerGroupView {
    const view: ITencentServerGroupView = { ...serverGroup } as ITencentServerGroupView;
    if (serverGroup.scalingPolicies) {
      view.scalingPolicies = serverGroup.scalingPolicies.map(policy => this.transformScalingPolicy(policy));
    }
    return view;
  }

  public normalizeServerGroup(serverGroup: ITencentServerGroup): IPromise<ITencentServerGroup> {
    serverGroup.instances.forEach(instance => {
      instance.vpcId = serverGroup.vpcId;
    });
    return VpcReader.listVpcs().then(vpc => this.addVpcNameToServerGroup(serverGroup)(vpc));
  }

  private addVpcNameToServerGroup(serverGroup: ITencentServerGroup): (vpc: IVpc[]) => ITencentServerGroup {
    return (vpcs: IVpc[]) => {
      const match = vpcs.find(test => test.id === serverGroup.vpcId);
      serverGroup.vpcName = match ? match.name : '';
      return serverGroup;
    };
  }

  public convertServerGroupCommandToDeployConfiguration(base: any): any {
    const command = {
      ...base,
      backingData: {},
      viewState: {},
      availabilityZones: {},
      type: base.type,
      cloudProvider: 'tencent',
      application: base.application,
      stack: base.stack,
      detail: base.detail,
      freeFormDetails: base.detail,
      strategy: base.strategy,
      account: base.credentials,
      accountName: base.credentials,
      imageId: base.imageId,
      instanceType: base.instanceType,
      subnetIds: base.subnetIds,
      subnetType: base.subnetIds.join(''),
      credentials: base.credentials,
      capacity: base.capacity, // for pipline deploy
      maxSize: base.capacity.max,
      minSize: base.capacity.min,
      desiredCapacity: base.capacity.desired,
      terminationPolicies: base.terminationPolicies,
      loginSettings: base.keyPair
        ? {
            keyIds: [base.keyPair],
          }
        : undefined,
      targetHealthyDeployPercentage: base.targetHealthyDeployPercentage,
      vpcId: base.vpcId,
      region: base.region,
      dataDisks: base.dataDisks,
      systemDisk: base.systemDisk,
      securityGroupIds: base.securityGroups,
      instanceTags: Object.keys(base.tags).map(tagKey => ({
        key: tagKey,
        value: base.tags[tagKey],
      })),
      internetAccessible: base.internetAccessible
        ? {
            internetChargeType: base.internetAccessible.internetChargeType,
            internetMaxBandwidthOut: base.internetAccessible.internetMaxBandwidthOut,
            publicIpAssigned: base.internetAccessible.publicIpAssigned,
          }
        : undefined,
      userData: base.userData ? btoa(base.userData) : undefined,
      defaultCooldown: base.cooldown,
      enhancedService: base.enhancedService,
      source: base.viewState && base.viewState.mode === 'clone' ? base.source : undefined,
      forwardLoadBalancers: base.forwardLoadBalancers,
    };
    return command;
  }

  public constructNewStepScalingPolicyTemplate(): IScalingPolicy {
    return {
      metricAlarm: {
        metricName: 'CPU_UTILIZATION',
        threshold: 50,
        statistic: 'AVERAGE',
        comparisonOperator: 'GREATER_THAN',
        continuousTime: 1,
        period: 60,
      },
      adjustmentType: 'CHANGE_IN_CAPACITY',
      stepAdjustments: [
        {
          adjustmentValue: 1,
          metricIntervalLowerBound: 0,
        },
      ],
      estimatedInstanceWarmup: 600,
    };
  }
}

export const TENCENT_SERVER_GROUP_TRANSFORMER = 'spinnaker.tencent.serverGroup.transformer';
module(TENCENT_SERVER_GROUP_TRANSFORMER, []).service('tencentServerGroupTransformer', TencentServerGroupTransformer);
