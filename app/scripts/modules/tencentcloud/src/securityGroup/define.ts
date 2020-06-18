import { Application, ISecurityGroup } from '@spinnaker/core';

export interface ISecurityGroupProps {
  isNew?: boolean;
  closeModal?(result?: any): void;
  dismissModal?(rejection?: any): void;
  application: Application;
}

export interface ISecurityGroupIngress {
  protocol: string;
  port: string | number;
  cidrBlock: string | number;
  action: string;
  index?: number;
}

export interface ISecurityGroupDetail extends ISecurityGroup {
  inRules?: ISecurityGroupIngress[];
  description: string;
}
