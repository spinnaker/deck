import { IFunctionSourceData } from '@spinnaker/core';

export interface IAmazonFunctionSourceData extends IFunctionSourceData {
  account: string;
  cloudProvider: string;
  createdTime: number;
  functionName: string;
  runtime: string;
  name: string;
  region: string;
  publish: boolean;
  description: string;
  eventSourceMappings: string[];
  functionArn: string;
  handler: string;
  layers: string;
  lastModified: number;
  type: string;
  memorySize: number;
  revisionId: string;
  revisions: {};
  role: string;
  timeout: number;
  tracingConfig: {
    mode: string;
  };
  version: string;
  // Some of the backend in clouddriver returns a vpcid (lowecase) only,
  // and was cached with some of that. Until caches roll off and we are
  // sure clouddriver is cleaned up, leave this dirtiness in here
  vpcid?: string;
  envVariables: {};
  environment: {
    variables: {};
  };
  vpcConfig: {
    subnetIds: [];
    securityGroupIds: [];
    vpcId: '';
  };
  s3bucket: string;
  s3key: string;
  tags: string | { [key: string]: string };
  deadLetterConfig: {
    targetArn: string;
  };
  KMSKeyArn: string;
}
