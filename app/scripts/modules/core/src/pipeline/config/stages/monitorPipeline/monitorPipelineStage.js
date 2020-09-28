'use strict';

import { module } from 'angular';

import { Registry } from 'core/registry';
import { ExecutionDetailsTasks } from '../common';
import { MonitorPipelineStageExecutionDetails } from './MonitorPipelineStageExecutionDetails';

export const CORE_PIPELINE_CONFIG_STAGES_MONITORPIPELINE_MONITORPIPELINESTAGE =
  'spinnaker.core.pipeline.stage.monitorPipelineStage';
export const name = CORE_PIPELINE_CONFIG_STAGES_MONITORPIPELINE_MONITORPIPELINESTAGE; // for backwards compatibility
module(CORE_PIPELINE_CONFIG_STAGES_MONITORPIPELINE_MONITORPIPELINESTAGE, []).config(function () {
  Registry.pipeline.registerStage({
    label: 'Monitor Pipeline',
    description: 'Monitors pipeline execution',
    key: 'monitorPipeline',
    restartable: true,
    synthetic: true,
    executionDetailsSections: [MonitorPipelineStageExecutionDetails, ExecutionDetailsTasks],
  });
});
