import { ILoadBalancerSourceData } from '@spinnaker/core';

import { NLBListenerProtocol } from 'tencent/domain';

import { IListenerRule } from './ITencentLoadBalancer';

export interface ITencentContainerServerGroupSourceData {
  detachedInstances: string[];
  isDisabled: boolean;
  name: string;
  region: string;
}

export interface ITencentLoadBalancerServerGroupSourceData extends ITencentContainerServerGroupSourceData {
  instances: ITencentLoadBalancerInstanceSourceData[];
}

export interface ITencentTargetGroupServerGroupSourceData extends ITencentContainerServerGroupSourceData {
  instances: ITencentTargetGroupInstanceSourceData[];
}

export interface ITencentInstanceHealthSourceData {
  type: string;
  state: 'InService' | 'OutOfService' | 'Unknown';
  reasonCode: 'ELB' | 'Instance' | 'N/A';
  description: string;
}

export interface ITencentTargetHealthSourceData {
  description: string;
  reason: string;
  state: 'initial' | 'healthy' | 'unhealthy' | 'unused' | 'draining';
}

export interface IClassicListenerSourceData {
  instancePort: number;
  instanceProtocol: string;
  loadBalancerPort: number;
  protocol: string;
}

export interface ITencentLoadBalancerSourceData extends ILoadBalancerSourceData {
  account: string;
  availabilityZones: string[];
  cloudProvider: string;
  createdTime: number;
  dnsname: string;
  loadBalancerName: string;
  loadBalancerType?: string;
  id: string;
  name: string;
  region: string;
  scheme: 'internal' | 'internet-facing';
  securityGroups: string[];
  serverGroups: ITencentLoadBalancerServerGroupSourceData[];
  subnets: string[];
  type: string;
  vpcId: string;
  // Some of the backend in clouddriver returns a vpcid (lowecase) only,
  // and was cached with some of that. Until caches roll off and we are
  // sure clouddriver is cleaed up, leave this dirtiness in here
  vpcid?: string;
}

export interface ITencentLoadBalancerInstanceSourceData {
  id: string;
  zone: string;
  health: ITencentInstanceHealthSourceData;
}

export interface ITencentTargetGroupInstanceSourceData {
  id: string;
  zone: string;
  health: ITencentTargetHealthSourceData;
}

export interface ITencentTargetGroupSourceData {
  account: string;
  attributes: {
    'deregistration_delay.timeout_seconds': number;
    'stickiness.enabled': boolean;
    'stickiness.lb_cookie.duration_seconds': number;
    'stickiness.type': 'lb_cookie';
  };
  cloudProvider: string;
  healthCheckIntervalSeconds: number;
  healthCheckPath: string;
  healthCheckPort: string;
  healthCheckProtocol: string;
  healthCheckTimeoutSeconds: number;
  healthyThresholdCount: number;
  instances: string[];
  loadBalancerNames: string[];
  matcher: {
    httpCode: string;
  };
  name: string;
  port: number;
  protocol: string;
  region: string;
  serverGroups: ITencentTargetGroupServerGroupSourceData[];
  targetGroupArn: string;
  targetGroupName: string;
  targetType: string;
  type: string;
  unhealthyThresholdCount: number;
  vpcId: string;
}

export interface ICloudLoadBalancerCertificateSourceData {
  sslMode: string;
  certId: string;
  certCaId?: string;
}

export interface IApplicationLoadBalancerListenerSourceData {
  certificates?: ICloudLoadBalancerCertificateSourceData[];
  listenerArn: string;
  loadBalancerName: string;
  port: number;
  protocol: 'HTTP' | 'HTTPS';
  rules: IListenerRule[];
  sslPolicy?: string;
}

export interface ICloudLoadBalancerSourceData extends ITencentLoadBalancerSourceData {
  ipAddressType: 'ipv4' | 'dualstack';
  listeners: IApplicationLoadBalancerListenerSourceData[];
  loadBalancerArn: string;
  loadBalancerType: 'application';
  state: {
    code: 'active' | 'provisioning' | 'failed';
    reason?: string;
  };
  targetGroups: ITencentTargetGroupSourceData[];
}

export interface INetworkLoadBalancerListenerSourceData {
  certificates?: ICloudLoadBalancerCertificateSourceData[];
  defaultActions: Array<{
    targetGroupName: string;
    type: 'forward';
  }>;
  listenerArn: string;
  loadBalancerName: string;
  port: number;
  protocol: NLBListenerProtocol;
  rules: IListenerRule[];
  sslPolicy?: string;
}

export interface INetworkLoadBalancerSourceData extends ITencentLoadBalancerSourceData {
  ipAddressType: 'ipv4' | 'dualstack';
  listeners: INetworkLoadBalancerListenerSourceData[];
  loadBalancerArn: string;
  loadBalancerType: 'network';
  state: {
    code: 'active' | 'provisioning' | 'failed';
    reason?: string;
  };
  targetGroups: ITencentTargetGroupSourceData[];
}

export interface IClassicLoadBalancerSourceData extends ITencentLoadBalancerSourceData {
  healthCheck: {
    healthyThreshold: number;
    interval: number;
    target: string;
    timeout: number;
    unhealthyThreshold: number;
  };
  instances: string[];
  listenerDescriptions: Array<{ listener: IClassicListenerSourceData; policyNames: string[] }>;
  policies: {
    appCookieStickinessPolicies: Array<{
      CookieName: string;
      PolicyName: string;
    }>;
    lbcookieStickinessPolicies: Array<{
      CookieExpirationPeriod: string;
      PolicyName: string;
    }>;
    otherPolicies: any[];
  };
  sourceSecurityGroup: {
    groupName: string;
    ownerAlias: string;
  };
}
