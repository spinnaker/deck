<<<<<<< HEAD
import { AWSProviderSettings } from 'amazon/aws.settings';
import { Application } from '@spinnaker/core';

import { IAmazonFunctionUpsertCommand, IAmazonFunction } from 'amazon/domain';

export class AwsFunctionTransformer {
  public normalizeFunction(functionDef: IAmazonFunction): IAmazonFunction {
    const normalizedFunctionDef: IAmazonFunction = functionDef;
    normalizedFunctionDef.credentials = functionDef.account;
    return normalizedFunctionDef;
  }

  public convertFunctionForEditing(functionDef: IAmazonFunction): IAmazonFunctionUpsertCommand {
    const toEdit: IAmazonFunctionUpsertCommand = {
      role: functionDef.role,
      runtime: functionDef.runtime,
      s3bucket: functionDef.s3bucket,
      s3key: functionDef.s3key,
      handler: functionDef.handler,
      tags: functionDef.tags,
      memorySize: functionDef.memorySize,
      timeout: functionDef.timeout,
      envVariables: functionDef.environment ? functionDef.environment.variables : {},
      functionName: functionDef.functionName,
      region: functionDef.region,
      credentials: functionDef.account,
      description: functionDef.description,
      tracingConfig: {
        mode: functionDef.tracingConfig ? functionDef.tracingConfig.mode : '',
      },
      deadLetterConfig: {
        targetArn: functionDef.deadLetterConfig ? functionDef.deadLetterConfig.targetArn : '',
      },
      KMSKeyArn: functionDef.KMSKeyArn ? functionDef.KMSKeyArn : '',
      subnetIds: functionDef.vpcConfig ? functionDef.vpcConfig.subnetIds : [],
      securityGroupIds: functionDef.vpcConfig ? functionDef.vpcConfig.securityGroupIds : [],
      vpcId: functionDef.vpcConfig ? functionDef.vpcConfig.vpcId : '',
      publish: functionDef.publish,
      cloudProvider: functionDef.cloudProvider,
      operation: '',
    };
    return toEdit;
  }

  public constructNewAwsFunctionTemplate(application: Application): IAmazonFunctionUpsertCommand {
    const defaultCredentials = application.defaultCredentials.aws || AWSProviderSettings.defaults.account,
      defaultRegion = application.defaultRegions.aws || AWSProviderSettings.defaults.region;

    return {
      role: '',
      runtime: '',
      s3bucket: '',
      s3key: '',
      handler: '',
      functionName: '',
      publish: false,
      tags: {},
      memorySize: 128,
      description: '',

      credentials: defaultCredentials,
      cloudProvider: 'aws',
      detail: '',
      region: defaultRegion,
      envVariables: {},

      tracingConfig: {
        mode: 'PassThrough',
      },
      KMSKeyArn: '',
      vpcId: '',
      subnetIds: [],
      securityGroupIds: [],
      timeout: 3,
      deadLetterConfig: {
        targetArn: '',
      },
      operation: '',
    };
=======
import { IAmazonFunction } from 'amazon/domain';

export class AwsFunctionTransformer {
  public normalizeFunction(functionDef: IAmazonFunction): IAmazonFunction {
    return functionDef;
>>>>>>> upstream/master
  }
}
