'use strict';

import { module } from 'angular';

import { CREATE_PIPELINE_COMPONENT } from './createPipeline.component';
import { PIPELINE_GRAPH_COMPONENT } from './graph/pipeline.graph.component';
import { TARGET_SELECT_COMPONENT } from 'core/pipeline/config/targetSelect.component';
import { TRIGGERS } from './triggers/triggers.module';
import './triggers';
import './validation/requiredField.validator';
import './validation/anyFieldRequired.validator';
import './validation/serviceAccountAccess.validator';
import './validation/stageBeforeType.validator';
import './validation/stageOrTriggerBeforeType.validator';
import './validation/upstreamVersionProvided.validator';
import './validation/targetImpedance.validator';

import './pipelineConfig.less';
import { CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE } from './stages/stage.module';
import { CORE_PIPELINE_CONFIG_STAGES_BASEPROVIDERSTAGE_BASEPROVIDERSTAGE } from './stages/baseProviderStage/baseProviderStage';
import { CORE_PIPELINE_CONFIG_PARAMETERS_PIPELINE_MODULE } from './parameters/pipeline.module';
import { CORE_PIPELINE_CONFIG_PIPELINECONFIG_CONTROLLER } from './pipelineConfig.controller';
import { CORE_PIPELINE_CONFIG_PIPELINECONFIGVIEW } from './pipelineConfigView';
import { CORE_PIPELINE_CONFIG_PIPELINECONFIGURER } from './pipelineConfigurer';
import { CORE_PIPELINE_CONFIG_HEALTH_STAGEPLATFORMHEALTHOVERRIDE_DIRECTIVE } from './health/stagePlatformHealthOverride.directive';

export const CORE_PIPELINE_CONFIG_PIPELINECONFIG_MODULE = 'spinnaker.core.pipeline.config';
export const name = CORE_PIPELINE_CONFIG_PIPELINECONFIG_MODULE; // for backwards compatibility
module(CORE_PIPELINE_CONFIG_PIPELINECONFIG_MODULE, [
  CREATE_PIPELINE_COMPONENT,
  PIPELINE_GRAPH_COMPONENT,
  CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE,
  CORE_PIPELINE_CONFIG_STAGES_BASEPROVIDERSTAGE_BASEPROVIDERSTAGE,
  TRIGGERS,
  CORE_PIPELINE_CONFIG_PARAMETERS_PIPELINE_MODULE,
  CORE_PIPELINE_CONFIG_PIPELINECONFIG_CONTROLLER,
  CORE_PIPELINE_CONFIG_PIPELINECONFIGVIEW,
  CORE_PIPELINE_CONFIG_PIPELINECONFIGURER,
  TARGET_SELECT_COMPONENT,
  CORE_PIPELINE_CONFIG_HEALTH_STAGEPLATFORMHEALTHOVERRIDE_DIRECTIVE,
]);
