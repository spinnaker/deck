import { IInstance } from '@spinnaker/core';

export interface ITencentInstance extends IInstance {
  targetGroups?: string[];
}
