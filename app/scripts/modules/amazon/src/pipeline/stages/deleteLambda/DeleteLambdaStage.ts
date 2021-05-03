import { ExecutionDetailsTasks, ISpinnakerSettings, Registry } from '@spinnaker/core';

import { DeleteLambdaConfig } from './DeleteLambdaConfig';
import { DeleteLambdaExecutionDetails } from './DeleteLambdaExecutionDetails';
import { validate } from './DeleteLambdaValidator';

const SETTINGS: ISpinnakerSettings = (window as any).spinnakerSettings || {};

if (SETTINGS.feature?.functions) {
  Registry.pipeline.registerStage({
    label: 'AWS Lambda Delete',
    description: 'Delete an AWS Lambda Function',
    key: 'Aws.LambdaDeleteStage',
    component: DeleteLambdaConfig,
    validateFn: validate,
    executionDetailsSections: [DeleteLambdaExecutionDetails, ExecutionDetailsTasks],
  });
}
