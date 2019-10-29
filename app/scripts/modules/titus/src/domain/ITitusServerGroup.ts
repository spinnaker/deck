import { IAccountDetails, IServerGroup } from '@spinnaker/core';
import { IScalingPolicyView } from '@spinnaker/amazon';
import { IJobDisruptionBudget } from './IJobDisruptionBudget';
import { ITitusPolicy } from './ITitusScalingPolicy';
import { ITitusServiceJobProcesses } from './ITitusServiceJobProcesses';

export interface ITitusServerGroup extends IServerGroup {
  capacityGroup?: string;
  disruptionBudget?: IJobDisruptionBudget;
  id?: string;
  image?: ITitusImage;
  migrationPolicy?: { type: string };
  scalingPolicies?: ITitusPolicy[];
  serviceJobProcesses?: ITitusServiceJobProcesses;
  targetGroups?: string[];
}

export interface ITitusImage {
  dockerImageDigest: string;
  dockerImageName: string;
  dockerImageVersion: string;
}

export interface ITitusServerGroupView extends ITitusServerGroup {
  accountDetails?: IAccountDetails;
  scalingPolicies: IScalingPolicyView[];
}
