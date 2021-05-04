import { ExecutionDetailsTasks, ISpinnakerSettings, Registry } from '@spinnaker/core';

import { RouteLambdaConfig } from './RouteLambdaConfig';
import { RouteLambdaExecutionDetails } from './RouteLambdaExecutionDetails';
import { validate } from './RouteLambdaValidator';

const SETTINGS: ISpinnakerSettings = (window as any).spinnakerSettings || {};

if (SETTINGS.feature?.functions) {
  Registry.pipeline.registerStage({
    key: 'Aws.LambdaTrafficRoutingStage',
    label: `AWS Lambda Route`,
    description: 'Route traffic across various versions of your Lambda function',
    component: RouteLambdaConfig,
    executionDetailsSections: [RouteLambdaExecutionDetails, ExecutionDetailsTasks],
    validateFn: validate,
  });
}
