import React from 'react';
import { Overridable } from 'core/overrideRegistry';
import { ISecurityGroupDetail } from 'core/securityGroup';

export interface IAdditionalIpRulesProps {
  securityGroupDetails: ISecurityGroupDetail;
}

@Overridable('aws.securityGroup.additional.ipRules')
export class AdditionalIpRules extends React.Component<IAdditionalIpRulesProps> {
  public render(): any {
    return null;
  }
}
