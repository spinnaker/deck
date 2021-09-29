import * as React from 'react';

import type { Application, IServerGroup } from '@spinnaker/core';

import { StepPolicySummary } from './StepPolicySummary';
import type { IScalingPolicy } from '../../../domain';
import { TargetTrackingSummary } from './targetTracking/TargetTrackingSummary';

import './ScalingPolicySummary.less';

export interface IScalingPolicySummaryProps {
  application: Application;
  policy: IScalingPolicy;
  serverGroup: IServerGroup;
}

export const ScalingPolicySummary = ({ application, policy, serverGroup }: IScalingPolicySummaryProps) => {
  if (policy.policyType === 'TargetTrackingScaling') {
    return <TargetTrackingSummary application={application} policy={policy} serverGroup={serverGroup} />;
  }

  return <StepPolicySummary application={application} policy={policy} serverGroup={serverGroup} />;
};
