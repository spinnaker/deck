import { module } from 'angular';

import { ISecurityGroupsByAccount, ISecurityGroup } from '@spinnaker/core';

export class AwsSecurityGroupReader {

  public resolveIndexedSecurityGroup(indexedSecurityGroups: ISecurityGroupsByAccount, container: ISecurityGroup, securityGroupId: string): ISecurityGroup  {
    return indexedSecurityGroups[container.account][container.region][securityGroupId];
  }
}

export const AWS_SECURITY_GROUP_READER = 'spinnaker.amazon.securityGroup.reader';
module(AWS_SECURITY_GROUP_READER, []).service('awsSecurityGroupReader', AwsSecurityGroupReader);
