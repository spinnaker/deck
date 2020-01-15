import { module } from 'angular';

import { ExecutionDetailsTasks, BakeExecutionLabel, Registry } from '@spinnaker/core';

import { HuaweiCloudBakeStageConfig } from './HuaweiCloudBakeStageConfig';
import { HuaweiCloudBakeStageExecutionDetails } from './HuaweiCloudBakeStageExecutionDetails';

export const BAKE_STAGE = 'spinnaker.huaweicloud.pipeline.stage.bakeStage';

module(BAKE_STAGE, []).config(() => {
  Registry.pipeline.registerStage({
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
    defaultTimeoutMs: 60 * 60 * 1000, // 60 minutes
    validators: [
      { type: 'requiredField', fieldName: 'package' },
      { type: 'requiredField', fieldName: 'region' },
      {
        type: 'upstreamVersionProvided',
        checkParentTriggers: true,
        getMessage: labels =>
          'Bake stages should always have a stage or trigger preceding them that provides version information: ' +
          '<ul>' +
          labels.map(label => `<li>${label}</li>`).join('') +
          '</ul>' +
          'Otherwise, Spinnaker will bake and deploy the most-recently built package.',
      },
    ],
    restartable: true,
  });
});
