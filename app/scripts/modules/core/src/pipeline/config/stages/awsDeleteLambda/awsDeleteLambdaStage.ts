import { ExecutionDetailsTasks, Registry } from 'core';

import { DeleteLambdaConfig } from './DeleteLambdaConfig';
import { DeleteLambdaExecutionDetails } from './DeleteLambdaExecutionDetails';
import { validate } from './DeleteLambdaValidator';

Registry.pipeline.registerStage({
  label: 'AWS Lambda Delete',
  description: 'Delete an AWS Lambda Function',
  key: 'Aws.LambdaDeleteStage',
  component: DeleteLambdaConfig,
  validateFn: validate,
  executionDetailsSections: [DeleteLambdaExecutionDetails, ExecutionDetailsTasks],
});
