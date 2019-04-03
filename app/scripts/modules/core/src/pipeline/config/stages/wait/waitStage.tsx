import * as React from 'react';
import { Registry } from 'core/registry';

import { IExecutionStageLabelComponentProps } from 'core/domain';
import { ExecutionDetailsTasks } from '../common';
import { WaitExecutionDetails } from './WaitExecutionDetails';
import { WaitExecutionLabel } from './WaitExecutionLabel';
import { WaitStageConfig } from './WaitStageConfig';
import { SkipWait } from './SkipWait';

Registry.pipeline.registerStage({
  label: 'Wait',
  description: 'Waits a specified period of time',
  key: 'wait',
  component: WaitStageConfig,
  executionDetailsSections: [WaitExecutionDetails, ExecutionDetailsTasks],
  executionLabelComponent: (props: IExecutionStageLabelComponentProps) => (
    <WaitExecutionLabel {...props} skipWaitComponent={SkipWait} />
  ),
  useCustomTooltip: true,
  strategy: true,
  validators: [{ type: 'requiredField', fieldName: 'waitTime' }],
});
