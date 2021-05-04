import { ExecutionDetailsTasks, ISpinnakerSettings, Registry } from '@spinnaker/core';

import { InvokeLambdaConfig } from './InvokeLambdaConfig';
import { InvokeLambdaExecutionDetails } from './InvokeLambdaExecutionDetails';
import { validate } from './InvokeLambdaValidator';

const SETTINGS: ISpinnakerSettings = (window as any).spinnakerSettings || {};

if (SETTINGS.feature?.functions) {
  Registry.pipeline.registerStage({
    key: 'Aws.LambdaInvokeStage',
    label: `AWS Lambda Invoke`,
    description: 'Invoke a Lambda function',
    component: InvokeLambdaConfig,
    executionDetailsSections: [InvokeLambdaExecutionDetails, ExecutionDetailsTasks],
    validateFn: validate,
  });
}
