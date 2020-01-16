import { module } from 'angular';
import { ExecutionDetailsTasks, BakeExecutionLabel, Registry } from '@spinnaker/core';

import { HuaweiCloudBakeStageConfig, validate } from './HuaweiCloudBakeStageConfig';
import { HuaweiCloudBakeStageExecutionDetails } from './HuaweiCloudBakeStageExecutionDetails';

export const BAKE_STAGE = 'spinnaker.huaweicloud.pipeline.stage.bakeStage';

module(BAKE_STAGE, []).config(() => {
  Registry.pipeline.registerStage({
    key: 'bake',
    provides: 'bake',
    cloudProvider: 'huaweicloud',
    label: 'Bake',
    description: 'Bakes an image',
    executionLabelComponent: BakeExecutionLabel,
    extraLabelLines: stage => {
      return stage.masterStage.context.allPreviouslyBaked || stage.masterStage.context.somePreviouslyBaked ? 1 : 0;
    },
    component: HuaweiCloudBakeStageConfig,
    executionDetailsSections: [HuaweiCloudBakeStageExecutionDetails, ExecutionDetailsTasks],
    validateFn: validate,
    restartable: true,
  });
});
