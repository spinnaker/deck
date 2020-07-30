import {
  IInstance,
  ILoadBalancer,
  IMoniker,
  ISecurityGroupDetail,
  IServerGroup,
  IServerGroupManager,
} from '@spinnaker/core';

export interface IKubernetesInstance extends IInstance {
  kind: string;
  name: string;
  humanReadableName: string;
  displayName: string;
  apiVersion: string;
  namespace: string;
  moniker: IMoniker;
}

export interface IKubernetesLoadBalancer extends ILoadBalancer {
  kind: string;
  displayName: string;
  apiVersion: string;
  namespace: string;
}

export interface IKubernetesSecurityGroup extends ISecurityGroupDetail {
  account: string;
  kind: string;
  displayName: string;
  apiVersion: string;
  moniker: IMoniker;
  namespace: string;
}

export interface IKubernetesServerGroup extends IServerGroup {
  kind: string;
  displayName: string;
  apiVersion: string;
  disabled: boolean;
  namespace: string;
}

export interface IKubernetesServerGroupManager extends IServerGroupManager {
  kind: string;
  displayName: string;
  apiVersion: string;
  namespace: string;
}
