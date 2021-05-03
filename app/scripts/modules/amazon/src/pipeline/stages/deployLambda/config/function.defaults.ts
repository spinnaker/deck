import { IAmazonFunctionUpsertCommand } from 'amazon';

export function constructNewAwsFunctionTemplate(): IAmazonFunctionUpsertCommand {
  const defaultCredentials = '';
  const defaultRegion = '';
  return {
    role: '',
    runtime: '',
    s3key: '',
    s3bucket: '',
    handler: '',
    functionName: '',
    publish: false,
    tags: {},
    memorySize: 128,
    description: '',

    credentials: defaultCredentials,
    cloudProvider: 'aws',
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
    targetGroups: '',
    kmskeyArn: '',
  };
}
