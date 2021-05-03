import { ExecutionDetailsTasks, ISpinnakerSettings, Registry } from '@spinnaker/core';

import { LambdaDeploymentConfig, validate } from './LambdaDeploymentStageConfig';
import { LambdaDeploymentExecutionDetails } from './LambdaDeploymentStageExecutionDetails';

const SETTINGS: ISpinnakerSettings = (window as any).spinnakerSettings || {};

if (SETTINGS.feature?.functions) {
  Registry.pipeline.registerStage({
    label: 'AWS Lambda Deployment',
    description: 'Create a Single AWS Lambda Function',
    key: 'Aws.LambdaDeploymentStage',
    component: LambdaDeploymentConfig,
    validateFn: validate,
    executionDetailsSections: [LambdaDeploymentExecutionDetails, ExecutionDetailsTasks],
  });
}
