import { module } from 'angular';

import { ISecurityGroupsByAccount, ISecurityGroup } from '@spinnaker/core';

export class TencentSecurityGroupReader {
  public resolveIndexedSecurityGroup(
    indexedSecurityGroups: ISecurityGroupsByAccount,
    container: ISecurityGroup,
    securityGroupId: string,
  ): ISecurityGroup {
    return indexedSecurityGroups[container.account][container.region][securityGroupId];
  }
}

export const TENCENT_SECURITY_GROUP_READER = 'spinnaker.tencent.securityGroup.reader';
module(TENCENT_SECURITY_GROUP_READER, []).service('tencentSecurityGroupReader', TencentSecurityGroupReader);
