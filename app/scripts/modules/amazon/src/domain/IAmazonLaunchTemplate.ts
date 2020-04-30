import { IBlockDeviceMapping } from './IAmazonBlockDeviceMapping';

export interface IIamInstanceProfile {
  arn?: string;
  name: string;
}

export interface ICpuOptions {
  coreCount?: number;
  threadsPerCore?: number;
}

export interface IElasticGpuSpecification {
  type?: string;
}

export interface IElasticInterfaceAccelerator {
  count?: number;
  type?: string;
}

export interface ILicenseConfig {
  licenseConfigurationArn?: string;
}

export interface IMetadataOptions {
  httpEndpoint?: 'disabled' | 'enabled';
  httpPutResponseHopLimit?: number;
  httpsTokens?: 'required' | 'optional';
  state?: 'pending' | 'applied';
}

export interface ITagSpecification {
  resourceType?: string;
  tagSet?: Array<{
    [key: string]: string;
  }>;
}

export interface ILaunchTemplateData {
  [attribute: string]: any;
  blockDeviceMappings?: IBlockDeviceMapping[];
  cpuOptions?: ICpuOptions;
  disableApiTermination?: boolean;
  ebsOptimized: boolean;
  elasticGpuSpecifications?: IElasticGpuSpecification[];
  elasticInferenceAccelerators?: IElasticInterfaceAccelerator[];
  iamInstanceProfile: IIamInstanceProfile;
  imageId: string;
  instanceInitiatedShutdownBehavior?: 'stop' | 'terminate';
  instanceType: string;
  kernelId?: string;
  keyName?: string;
  licenseSpecifications?: ILicenseConfig[];
  metadataOptions: IMetadataOptions;
  ramDiskId?: string;
  tagSpecifications?: ITagSpecification[];
  userData?: string;
}

export interface IAmazonLaunchTemplate {
  createdBy: string;
  createdTime: number;
  defaultVersion: boolean;
  launchTemplateData: ILaunchTemplateData;
  launchTemplateId: string;
  launchTemplateName: string;
  versionDescription?: string;
  versionNumber: number;
}
