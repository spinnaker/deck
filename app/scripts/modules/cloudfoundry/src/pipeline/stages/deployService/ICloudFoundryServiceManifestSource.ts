import { IArtifact } from 'core/domain';

export interface ICloudfoundryServiceManifestDirectSource {
  parameters?: string;
  service: string;
  serviceInstanceName: string;
  servicePlan: string;
  tags?: string[];
  updatable: boolean;
}

export interface ICloudFoundryServiceUserProvidedSource {
  credentials?: string;
  routeServiceUrl: string;
  serviceInstanceName: string;
  syslogDrainUrl?: string;
  tags?: string[];
  updatable: boolean;
}

export interface ICloudFoundryServiceManifestSource {
  artifact?: IArtifact;
  artifactId?: string;
  direct?: ICloudfoundryServiceManifestDirectSource | ICloudFoundryServiceUserProvidedSource;
}
