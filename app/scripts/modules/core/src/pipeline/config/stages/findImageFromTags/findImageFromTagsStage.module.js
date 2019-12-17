'use strict';

import { module } from 'angular';

import { STAGE_COMMON_MODULE } from '../common/stage.common.module';
import { CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE } from '../stage.module';
import { CORE_PIPELINE_CONFIG_STAGES_FINDIMAGEFROMTAGS_FINDIMAGEFROMTAGSSTAGE } from './findImageFromTagsStage';

export const CORE_PIPELINE_CONFIG_STAGES_FINDIMAGEFROMTAGS_FINDIMAGEFROMTAGSSTAGE_MODULE =
  'spinnaker.core.pipeline.stage.findImageFromTags';
export const name = CORE_PIPELINE_CONFIG_STAGES_FINDIMAGEFROMTAGS_FINDIMAGEFROMTAGSSTAGE_MODULE; // for backwards compatibility
module(CORE_PIPELINE_CONFIG_STAGES_FINDIMAGEFROMTAGS_FINDIMAGEFROMTAGSSTAGE_MODULE, [
  CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE,
  STAGE_COMMON_MODULE,
  CORE_PIPELINE_CONFIG_STAGES_FINDIMAGEFROMTAGS_FINDIMAGEFROMTAGSSTAGE,
]);
