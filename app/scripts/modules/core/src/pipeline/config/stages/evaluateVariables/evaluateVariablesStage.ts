import { Registry } from 'core/registry';

import { ExecutionDetailsTasks } from '../core';
import { WaitExecutionDetails } from './WaitExecutionDetails';
import { WaitExecutionLabel } from './WaitExecutionLabel';
import { EvaluateVariablesStageConfig } from './EvaluateVariablesStageConfig';

export const DEFAULT_SKIP_WAIT_TEXT = 'The pipeline will proceed immediately, marking this stage completed.';

Registry.pipeline.registerStage({
  label: 'Evaluate Variables',
  description: 'evalutes variables',
  key: 'evaluateVariables',
  component: EvaluateVariablesStageConfig,
  executionDetailsSections: [WaitExecutionDetails, ExecutionDetailsTasks],
  executionLabelComponent: WaitExecutionLabel,
  useCustomTooltip: true,
  strategy: true,
  validators: [{ type: 'requiredField', fieldName: 'variables' }],
});
