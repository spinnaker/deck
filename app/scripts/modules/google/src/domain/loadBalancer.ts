import { ILoadBalancer } from '@spinnaker/core';

import { IGceBackendService } from './backendService';

export interface IGceLoadBalancer extends ILoadBalancer {
  account: string;
  credentials: string;
  detail: string;
  loadBalancerName: string;
  portRange?: string;
  region: string;
  stack: string;
}

export interface IGceHttpLoadBalancer extends IGceLoadBalancer {
  certificate: string;
  defaultService: IGceBackendService;
  detail: string;
  hostRules: IGceHostRule;
  ipAddress: string;
  listeners: IGceListener[];
  loadBalancerType: 'HTTP';
  provider: 'gce';
  region: 'global';
  stack: string;
  urlMapName: string;
}

export interface IGceHostRule {
  hostPatterns: string[];
  pathMatcher: IGcePathMatcher;
}

export interface IGcePathMatcher {
  pathRules: IGcePathRule[];
}

export interface IGcePathRule {
  paths: string[];
}

export interface IGceListener {
  certificate: string;
  created: boolean;
  detail: string;
  name: string;
  port: string;
  ports: string; // Comma-delimited list of ports.
  ipAddress: string;
  stack: string;
  subnet: string;
}
