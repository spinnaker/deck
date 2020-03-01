import { IAccountDetails, IServerGroup } from '@spinnaker/core';

export interface ISpotServerGroup extends IServerGroup {
  appsManagerUri?: string;
  diskQuota: number;
  healthCheckType: string;
  healthCheckHttpEndpoint: string;
  state: 'STARTED' | 'STOPPED';
  metricsUri?: string;
  memory: number;
  serviceInstances: ISpotServiceInstance[];
  env: ISpotEnvVar[];
  ciBuild: ISpotBuildInfo;
  appArtifact: ISpotArtifactInfo;
  pipelineId: string;
}

export interface ISpotServiceInstance {
  name: string;
  plan: string;
  service: string;
  tags?: string[];
}

export interface ISpotEnvVar {
  key: string;
  value: string;
}

export interface ISpotBuildInfo {
  jobName: string;
  jobNumber: string;
  jobUrl: string;
}

export interface ISpotArtifactInfo {
  name: string;
  version: string;
  url: string;
}

export interface ISpotServerGroupView extends ISpotServerGroup {
  accountDetails?: IAccountDetails;
}
