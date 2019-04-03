import * as React from 'react';
import { Registry } from 'core/registry';

import { IExecutionStageLabelComponentProps } from 'core/domain';
import { ExecutionDetailsTasks } from '../common';
import { WaitForConditionExecutionDetails } from './WaitForConditionExecutionDetails';
import { WaitExecutionLabel } from '../wait/WaitExecutionLabel';
import { SkipConditionWait } from './SkipConditionWait';

Registry.pipeline.registerStage({
  label: 'Wait For Condition',
  description: 'Waits until a set of conditions are met',
  key: 'waitForCondition',
  executionDetailsSections: [WaitForConditionExecutionDetails, ExecutionDetailsTasks],
  executionLabelComponent: (props: IExecutionStageLabelComponentProps) => (
    <WaitExecutionLabel {...props} skipWaitComponent={SkipConditionWait} />
  ),
  useCustomTooltip: true,
  synthetic: true,
});
