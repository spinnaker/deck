import { IAccountDetails, IServerGroup, IAsg } from '@spinnaker/core';
import { ISuspendedProcess } from 'amazon';

import { IScalingPolicy } from './IScalingPolicy';
import { IScalingPolicyView } from 'amazon/domain';

export interface IAmazonAsg extends IAsg {
  availabilityZones: string[];
  defaultCooldown: number;
  healthCheckType: string;
  healthCheckGracePeriod: number;
  terminationPolicies: string[];
  enabledMetrics: Array<{ metric: string }>;
  vpczoneIdentifier?: string;
  suspendedProcesses?: ISuspendedProcess[];
}

export interface IAmazonServerGroup extends IServerGroup {
  image?: any;
  scalingPolicies?: IScalingPolicy[];
  targetGroups?: string[];
  asg: IAmazonAsg;
}

export interface IScheduledAction {
  recurrence: number;
  minSize: number;
  maxSize: number;
  desiredCapacity: number;
}

export interface IAmazonServerGroupView extends IAmazonServerGroup {
  accountDetails?: IAccountDetails;
  scalingPolicies: IScalingPolicyView[];
  scheduledActions?: IScheduledAction[];
}
