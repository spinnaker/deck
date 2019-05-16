import { IServerGroup } from '@spinnaker/core';

import { ICloudFoundrySpace, ICloudFoundryDroplet } from 'cloudfoundry/domain';
import { ICloudFoundryInstance } from 'cloudfoundry/domain/ICloudFoundryInstance';

export interface ICloudFoundryServerGroup extends IServerGroup {
  appsManagerUri?: string;
  diskQuota: number;
  healthCheckType: string;
  healthCheckHttpEndpoint: string;
  state: 'STARTED' | 'STOPPED';
  instances: ICloudFoundryInstance[];
  metricsUri?: string;
  memory: number;
  space: ICloudFoundrySpace;
  droplet?: ICloudFoundryDroplet;
  serviceInstances: ICloudFoundryServiceInstance[];
  env: ICloudFoundryEnvVar[];
  ciBuild: ICloudFoundryBuildInfo;
  appArtifact: ICloudFoundryArtifactInfo;
}

export interface ICloudFoundryServiceInstance {
  name: string;
  plan: string;
  service: string;
  tags?: string[];
}

export interface ICloudFoundryEnvVar {
  key: string;
  value: string;
}

export interface ICloudFoundryBuildInfo {
  jobName: string;
  jobNumber: string;
  jobUrl: string;
}

export interface ICloudFoundryArtifactInfo {
  name: string;
  version: string;
  url: string;
}
