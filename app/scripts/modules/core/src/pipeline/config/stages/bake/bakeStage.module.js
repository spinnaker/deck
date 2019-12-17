'use strict';

import { module } from 'angular';

import { PIPELINE_BAKE_STAGE_CHOOSE_OS } from 'core/pipeline/config/stages/bake/bakeStageChooseOs.component';
import { CORE_PIPELINE_CONFIG_STAGES_BAKE_BAKESTAGE } from './bakeStage';
import { CORE_PIPELINE_CONFIG_STAGES_BAKE_MODAL_ADDEXTENDEDATTRIBUTE_CONTROLLER_MODAL } from './modal/addExtendedAttribute.controller.modal';

export const CORE_PIPELINE_CONFIG_STAGES_BAKE_BAKESTAGE_MODULE = 'spinnaker.core.pipeline.stage.bake';
export const name = CORE_PIPELINE_CONFIG_STAGES_BAKE_BAKESTAGE_MODULE; // for backwards compatibility
module(CORE_PIPELINE_CONFIG_STAGES_BAKE_BAKESTAGE_MODULE, [
  CORE_PIPELINE_CONFIG_STAGES_BAKE_BAKESTAGE,
  CORE_PIPELINE_CONFIG_STAGES_BAKE_MODAL_ADDEXTENDEDATTRIBUTE_CONTROLLER_MODAL,
  PIPELINE_BAKE_STAGE_CHOOSE_OS,
]);
