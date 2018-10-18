import { Registry } from 'core/registry';

import { ExecutionDetailsTasks } from '../core';
import { EvaluateVariablesExecutionDetails } from './EvaluateVariablesExecutionDetails';
import { EvaluateVariablesExecutionLabel } from './EvaluateVariablesExecutionLabel';
import { EvaluateVariablesStageConfig } from './EvaluateVariablesStageConfig';

Registry.pipeline.registerStage({
  label: 'Evaluate Variables',
  description: 'evalutes variables',
  key: 'evaluateVariables',
  component: EvaluateVariablesStageConfig,
  executionDetailsSections: [EvaluateVariablesExecutionDetails, ExecutionDetailsTasks],
  executionLabelComponent: EvaluateVariablesExecutionLabel,
  useCustomTooltip: true,
  strategy: true,
  validators: [{ type: 'requiredField', fieldName: 'variables' }],
});
