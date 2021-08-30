import { cloneDeep } from 'lodash';

import {
  IAmazonServerGroup,
  IScalingPolicy,
  IStepAdjustment,
  IStepPolicyDescription,
  ITargetTrackingPolicy,
  IUpsertAlarmDescription,
  IUpsertScalingPolicyCommand,
} from '@spinnaker/amazon';

type PolicyType = 'Step' | 'TargetTracking';

export const TitusScalingPolicyCommandBuilder = {
  buildAlarm: (policy: IScalingPolicy, region: string): IUpsertAlarmDescription => {
    const alarm = policy?.alarms[0];
    return {
      comparisonOperator: alarm.comparisonOperator,
      region,
      dimensions: alarm.dimensions,
      disableEditingDimensions: alarm.disableEditingDimensions,
      evaluationPeriods: alarm.evaluationPeriods,
      metricName: alarm.metricName,
      namespace: alarm.namespace,
      period: alarm.period,
      statistic: alarm.statistic,
      threshold: alarm.threshold,
      unit: alarm.unit,
    };
  },

  buildStepPolicy: (policy: IScalingPolicy, threshold: number, cooldown: number): IStepPolicyDescription => {
    const stepAdjustments = policy.stepAdjustments.map((adjustment) => {
      const step = {
        scalingAdjustment: Math.abs(adjustment.scalingAdjustment),
      } as IStepAdjustment;

      if (adjustment.metricIntervalUpperBound !== undefined) {
        step.metricIntervalUpperBound = adjustment.metricIntervalUpperBound + threshold;
      }
      if (adjustment.metricIntervalLowerBound !== undefined) {
        step.metricIntervalLowerBound = adjustment.metricIntervalLowerBound + threshold;
      }

      return step;
    });

    return {
      cooldown: cooldown || 600,
      metricAggregationType: 'Average',
      stepAdjustments,
    };
  },

  buildNewCommand: (
    type: PolicyType,
    serverGroup: IAmazonServerGroup,
    policy: ITargetTrackingPolicy,
  ): IUpsertScalingPolicyCommand => {
    const command = {
      adjustmentType: type === 'Step' ? policy.adjustmentType : null,
      cloudProvider: serverGroup.cloudProvider,
      credentials: serverGroup.account,
      jobId: serverGroup.disabledDate,
      region: serverGroup.region,
      scalingPolicyID: policy.id,
      serverGroupName: serverGroup.name,
    } as IUpsertScalingPolicyCommand;

    if (type === 'Step') {
      command.alarm = TitusScalingPolicyCommandBuilder.buildAlarm(policy, serverGroup.region);
      command.minAdjustmentMagnitude = policy.minAdjustmentMagnitude || 1;
      command.step = TitusScalingPolicyCommandBuilder.buildStepPolicy(
        policy,
        command.alarm.threshold,
        command.cooldown,
      );
    }

    if (type === 'TargetTracking') {
      command.estimatedInstanceWarmup = policy.estimatedInstanceWarmup || 600;
      command.targetTrackingConfiguration = { ...policy.targetTrackingConfiguration };
    }

    return command;
  },

  prepareCommandForUpsert: (command: IUpsertScalingPolicyCommand, isRemove: boolean): IUpsertScalingPolicyCommand => {
    const commandToSubmit = cloneDeep(command);

    if (commandToSubmit.adjustmentType !== 'PercentChangeInCapacity') {
      delete commandToSubmit.minAdjustmentMagnitude;
    }

    if (commandToSubmit.step) {
      // adjust metricIntervalLowerBound/UpperBound for each step based on alarm threshold
      commandToSubmit.step.stepAdjustments.forEach((step) => {
        if (isRemove) {
          step.scalingAdjustment = 0 - step.scalingAdjustment;
          delete commandToSubmit.step.estimatedInstanceWarmup;
        }
        if (step.metricIntervalLowerBound !== undefined) {
          step.metricIntervalLowerBound -= commandToSubmit.alarm.threshold;
        }
        if (step.metricIntervalUpperBound !== undefined) {
          step.metricIntervalUpperBound -= commandToSubmit.alarm.threshold;
        }
      });
    } else {
      if (isRemove) {
        command.simple.scalingAdjustment = 0 - command.simple.scalingAdjustment;
      }
    }
    return commandToSubmit;
  },
};
