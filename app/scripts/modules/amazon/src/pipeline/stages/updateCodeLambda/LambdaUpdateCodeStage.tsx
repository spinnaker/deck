import { ExecutionDetailsTasks, ISpinnakerSettings, Registry } from '@spinnaker/core';

import { LambdaUpdateCodeConfig } from './LambdaUpdateCodeStageConfig';
import { LambdaUpdateCodeExecutionDetails } from './LambdaUpdateCodeStageExecutionDetails';
import { validate } from './LambdaUpdateCodeValidator';

const SETTINGS: ISpinnakerSettings = (window as any).spinnakerSettings || {};

if (SETTINGS.feature?.functions) {
  Registry.pipeline.registerStage({
    key: 'Aws.LambdaUpdateCodeStage',
    label: `AWS Lambda Update Code`,
    description: 'Update code for a single AWS Lambda Function',
    component: LambdaUpdateCodeConfig,
    executionDetailsSections: [LambdaUpdateCodeExecutionDetails, ExecutionDetailsTasks],
    validateFn: validate,
  });
}
