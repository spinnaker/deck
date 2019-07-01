import { IFunction, IFunctionDeleteCommand, IFunctionUpsertCommand } from '@spinnaker/core';

export interface IAmazonFunction extends IFunction {
  credentials?: string;
  role?: string;
  runtime: string;
  s3bucket: string;
  s3key: string;
  handler: string;
  functionName: string;
  publish: boolean;
  description: string;
  tags: [{}];
  memorySize: number;
  timeout: number;
  envVariables: {};
  tracingConfig: {
    mode: string;
  };
  deadLetterConfig: {
    targetArn: string;
  };
  KMSKeyArn: string;
  vpcConfig: {
    securityGroupIds: [];
    subnetIds: [];
    vpcId: string;
  };
  targetGroup?: string;
  targetGroups?: [];
}

export interface IAmazonFunctionUpsertCommand extends IFunctionUpsertCommand {
  role?: string;
  runtime: string;
  s3bucket: string;
  s3key: string;
  handler: string;
  tags: [];
  memorySize: number;
  timeout: number;
  envVariables: {};
  publish: boolean;
  tracingConfig: {
    mode: string;
  };
  deadLetterConfig: {
    targetArn: string;
  };
<<<<<<< HEAD
<<<<<<< HEAD
  encryKMSKeyArn: string;
  securityGroupIds: [];
  subnetIds: [];
  vpcId: string;
  targetGroup: string;
=======
  KMSKeyArn: string;
=======
  encryKMSKeyArn: string;
>>>>>>> 55f391bce... adding change for prefixing function name  with application name, and change for KMS key  field name
  securityGroupIds: [];
  subnetIds: [];
  vpcId: string;
<<<<<<< HEAD
>>>>>>> 1f7b4a5c6... Fixed error in editing function. Fixed format of VPC config details in upsert command
=======
  targetGroup: string;
>>>>>>> 4beba173a... Changed targetGroupARN to targetGroup
}

export interface IAmazonFunctionDeleteCommand extends IFunctionDeleteCommand {
  cloudProvider: string;
  functionName: string;
  region: string;
  credentials: string;
}