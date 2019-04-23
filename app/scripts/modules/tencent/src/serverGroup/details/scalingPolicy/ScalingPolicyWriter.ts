import { IPromise } from 'angular';

import { Application, IJob, IMetricAlarmDimension, IServerGroup, ITask, TaskExecutor } from '@spinnaker/core';

import {
  AlarmComparisonOperator,
  AlarmStatisticType,
  IScalingPolicy,
  IStepAdjustment,
  MetricAggregationType,
  ScalingPolicyAdjustmentType,
  StandardUnitType,
} from 'tencent/domain';

export interface IUpsertScalingPolicyCommand extends IJob {
  type?: string; // Orca/Clouddriver operation type
  cloudProvider: string;
  credentials: string;
  region: string;
  serverGroupName: string;
  adjustmentType: ScalingPolicyAdjustmentType;
  name?: string;
  minAdjustmentMagnitude?: number;
  alarm?: IUpsertAlarmDescription;
  simple?: ISimplePolicyDescription;
  step?: IStepPolicyDescription;
}

export interface ISimplePolicyDescription {
  cooldown: number;
  adjustmentValue: number;
}

export interface IStepPolicyDescription {
  stepAdjustments: IStepAdjustment[];
  estimatedInstanceWarmup: number;
  metricAggregationType: MetricAggregationType;
}

export interface IConfigurableMetric {
  namespace: string;
  metricName: string;
  dimensions: IMetricAlarmDimension[];
}

export interface IUpsertAlarmDescription extends IConfigurableMetric {
  name: string;
  asgName: string;
  region: string;
  alarmDescription: string;
  comparisonOperator: AlarmComparisonOperator;
  continuousTime: number;
  period: number;
  threshold: number;
  statistic: AlarmStatisticType;
  unit: StandardUnitType;
  alarmActionArns: string[];
  insufficientDataActionArns: string[];
  okActionArns: string[];
}

export class ScalingPolicyWriter {
  public static upsertScalingPolicy(application: Application, command: IUpsertScalingPolicyCommand): IPromise<ITask> {
    command.type = command.type || 'upsertScalingPolicy';
    return TaskExecutor.executeTask({
      application,
      description: 'Upsert scaling policy ' + (command.name || command.serverGroupName),
      job: [command],
    });
  }

  public static deleteScalingPolicy(
    application: Application,
    serverGroup: IServerGroup,
    scalingPolicy: IScalingPolicy,
  ): IPromise<ITask> {
    return TaskExecutor.executeTask({
      application,
      description: 'Delete scaling policy ' + scalingPolicy.policyName,
      job: [
        {
          application: application.name,
          type: 'deleteScalingPolicy',
          cloudProvider: 'tencent',
          accountName: serverGroup.account,
          credentials: serverGroup.account,
          region: serverGroup.region,
          policyName: scalingPolicy.policyName,
          serverGroupName: serverGroup.name,
          scalingPolicyId: scalingPolicy.autoScalingPolicyId,
        },
      ],
    });
  }
}
