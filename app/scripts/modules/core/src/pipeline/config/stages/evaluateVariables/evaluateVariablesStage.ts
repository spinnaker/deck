import { Registry } from 'core/registry';

import { ExecutionDetailsTasks } from '../core';
import { EvaluateVariablesExecutionDetails } from './EvaluateVariablesExecutionDetails';
import { EvaluateVariablesStageConfig } from './EvaluateVariablesStageConfig';

Registry.pipeline.registerStage({
  label: 'Evaluate Variables',
  description: 'evalutes variables',
  key: 'evaluateVariables',
  component: EvaluateVariablesStageConfig,
  executionDetailsSections: [EvaluateVariablesExecutionDetails, ExecutionDetailsTasks],
  useCustomTooltip: true,
  strategy: true,
  validators: [{ type: 'requiredField', fieldName: 'variables' }],
});
