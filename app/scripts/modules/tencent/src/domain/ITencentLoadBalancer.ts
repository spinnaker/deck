import { ITencentLoadBalancerSourceData } from './ITencentLoadBalancerSourceData';
import {
  ILoadBalancer,
  ILoadBalancerDeleteCommand,
  ILoadBalancerUpsertCommand,
  IInstance,
  IInstanceCounts,
  ISubnet,
} from '@spinnaker/core';

import { IAuthenticateOidcActionConfig } from 'tencent/loadBalancer/OidcConfigReader';

import { ITencentServerGroup } from './ITencentServerGroup';
import { ITencentHealthCheck } from './ITencentHealth';

export type ClassicListenerProtocol = 'HTTP' | 'HTTPS' | 'TCP' | 'SSL';
export type CLBListenerProtocol = 'HTTP' | 'HTTPS' | 'TCP' | 'UDP';
export type IListenerActionType = 'forward' | 'authenticate-oidc' | 'redirect';
export type NLBListenerProtocol = 'TCP';

export interface ITencentLoadBalancer extends ILoadBalancer {
  availabilityZones?: string[];
  credentials?: string;
  detachedInstances?: IInstance[];
  elb?: ITencentLoadBalancerSourceData;
  isInternal?: boolean;
  regionZones: string[];
  serverGroups: ITencentServerGroup[];
  subnets?: string[];
  subnetDetails?: ISubnet[];
  subnetType?: string;
  subnetId?: string;
  id?: string;
  loadBalancerId?: string;
}

export interface IClassicListener {
  internalProtocol: ClassicListenerProtocol;
  internalPort: number;
  externalProtocol: ClassicListenerProtocol;
  externalPort: number;
  sslCertificateType?: string;
}

export interface ITencentClassicLoadBalancer extends ITencentLoadBalancer {
  healthCheckPath: string;
  healthCheckPort: number;
  healthCheckProtocol: string;
  healthTimeout: number;
  healthInterval: number;
  healthyThreshold: number;
  listeners: IClassicListener[];
  unhealthyThreshold: number;
  idleTimeout?: number;
}

export interface ITencentApplicationLoadBalancer extends ITencentLoadBalancer {
  listeners: ICLBListener[];
  application: string;
  targetGroups: ITargetGroup[];
  ipAddressType?: string; // returned from clouddriver
  deletionProtection: boolean;
  idleTimeout: number;
}

export interface ITencentNetworkLoadBalancer extends ITencentLoadBalancer {
  listeners: INLBListener[];
  targetGroups: ITargetGroup[];
  ipAddressType?: string; // returned from clouddriver
  deletionProtection: boolean;
  idleTimeout: number;
}

export interface IRedirectActionConfig {
  host?: string;
  path?: string;
  port?: string;
  protocol?: 'HTTP' | 'HTTPS' | '#{protocol}';
  query?: string;
  statusCode: 'HTTP_301' | 'HTTP_302';
}

export interface IListenerAction {
  authenticateOidcConfig?: IAuthenticateOidcActionConfig;
  order?: number;
  redirectActionConfig?: IRedirectActionConfig; // writes
  redirectConfig?: IRedirectActionConfig; // reads
  targetGroupName?: string;
  type: IListenerActionType;
  port?: number;
}

export interface ICLBListenerCertificate {
  sslMode: string;
  certId: string;
  certCaId?: string;
}

export interface ICLBListener {
  certificates: ICLBListenerCertificate[];
  port: number;
  protocol: string;
  rules: IListenerRule[];
  sslPolicy?: string;
  listenerId?: string;
  listenerName?: string;
}

export interface INLBListener {
  certificates: ICLBListenerCertificate[];
  defaultActions: IListenerAction[];
  port: number;
  protocol: string;
  rules: IListenerRule[];
  sslPolicy?: string;
}

export interface IListenerRule {
  domain: string;
  url: string;
  locationId?: string;
  healthCheck?: ITencentHealthCheck;
  default?: boolean;
  priority?: number | 'default';
  [key: string]: any;
}

export type ListenerRuleConditionField = 'path-pattern' | 'host-header';

export interface IListenerRuleCondition {
  field: ListenerRuleConditionField;
  values: string[];
}

export interface ITargetGroupAttributes {
  deregistrationDelay: number;
  stickinessEnabled: boolean;
  stickinessType: string;
  stickinessDuration: number;
}

export interface ITargetGroup {
  account: string; // returned from clouddriver
  attributes?: ITargetGroupAttributes;
  cloudProvider: string; // returned from clouddriver
  detachedInstances?: IInstance[];
  healthCheckProtocol: string;
  healthCheckPort: number;
  healthCheckPath: string;
  healthTimeout: number;
  healthInterval: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
  instanceCounts?: IInstanceCounts;
  instances?: IInstance[];
  loadBalancerNames: string[]; // returned from clouddriver
  name: string;
  port: number;
  protocol: string;
  provider?: string;
  region: string; // returned from clouddriver
  serverGroups?: ITencentServerGroup[];
  targetType?: string;
  type: string; // returned from clouddriver
  vpcId?: string;
  vpcName?: string;
}

export interface IListenerDescription {
  isNew?: boolean;
  certificates?: ICLBListenerCertificate[];
  certificate?: ICLBListenerCertificate;
  protocol: CLBListenerProtocol | NLBListenerProtocol;
  port: number;
  sslPolicy?: string;
  rules?: IListenerRule[];
  healthCheck?: ITencentHealthCheck;
  listenerName?: string;
}

export interface ICLBTargetGroupDescription {
  name: string;
  protocol: 'HTTP' | 'HTTPS';
  port: number;
  targetType: 'instance' | 'ip';
  attributes: {
    // Defaults to 300
    deregistrationDelay?: number;
    // Defaults to false
    stickinessEnabled?: boolean;
    // Defaults to 'lb_cookie'. The only option for now, but they promise there will be more...
    stickinessType?: 'lb_cookie';
    // Defaults to 86400
    stickinessDuration?: number;
  };
  // Defaults to 10
  healthCheckInterval?: number;
  // Defaults to '200-299'
  healthCheckMatcher?: string;
  healthCheckPath: string;
  healthCheckPort: string;
  healthCheckProtocol: 'HTTP' | 'HTTPS';
  // Defaults to 10
  healthyThreshold?: number;
  // Defaults to 5
  healthCheckTimeout?: number;
  // Defaults to 2
  unhealthyThreshold?: number;
}

export interface INLBTargetGroupDescription {
  name: string;
  protocol: 'TCP';
  port: number;
  targetType: 'instance' | 'ip';
  attributes: {
    // Defaults to 300
    deregistrationDelay?: number;
  };
  // Defaults to 10
  healthCheckInterval?: number;
  healthCheckPort: string;
  healthCheckProtocol: 'TCP' | 'HTTP' | 'HTTPS';
  healthCheckPath: string;
  // Defaults to 10
  healthyThreshold?: number;
  // Defaults to 5
  healthCheckTimeout?: number;
  // Defaults to 10
  unhealthyThreshold?: number;
}

export interface ITencentLoadBalancerUpsertCommand extends ILoadBalancerUpsertCommand {
  availabilityZones: { [region: string]: string[] };
  isInternal: boolean;
  // listeners will be overriden and re-typed by extending types (application, classic)
  listeners: any[];
  // If loadBalancerType is not provided, will default to 'classic' for bwc
  loadBalancerType?: 'classic' | 'application' | 'network';
  regionZones: string[];
  securityGroups: string[];
  subnetType: string;
  usePreferredZones?: boolean;
  vpcId: string;
  application: string;
}

export interface ITencentLoadBalancerDeleteCommand extends ILoadBalancerDeleteCommand {
  loadBalancerId: string;
  region: string;
  account: string;
  application: string;
}

export interface IClassicListenerDescription extends IClassicListener {
  sslCertificateId?: string;
  sslCertificateName?: string;
}

export interface ITencentClassicLoadBalancerUpsertCommand extends ITencentLoadBalancerUpsertCommand {
  healthCheck: string;
  healthCheckPath: string;
  healthCheckProtocol: string;
  healthCheckPort: number;
  healthInterval?: number;
  healthTimeout?: number;
  healthyThreshold?: number;
  listeners: IClassicListenerDescription[];
  unhealthyThreshold?: number;
  idleTimeout?: number;
}

export interface ITencentApplicationLoadBalancerUpsertCommand extends ITencentLoadBalancerUpsertCommand {
  deletionProtection?: boolean;
  idleTimeout?: number;
  listener?: IListenerDescription[];
  listeners: IListenerDescription[];
  targetGroups?: ICLBTargetGroupDescription[];
  subnetId: string;
}

export interface ITencentNetworkLoadBalancerUpsertCommand extends ITencentLoadBalancerUpsertCommand {
  deletionProtection: boolean;
  listeners: IListenerDescription[];
  targetGroups: INLBTargetGroupDescription[];
}
