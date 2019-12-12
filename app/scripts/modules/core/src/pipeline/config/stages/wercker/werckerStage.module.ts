import { module } from 'angular';

import { WERCKER_STAGE } from './werckerStage';
import { STAGE_COMMON_MODULE } from '../common/stage.common.module';
import { TIME_FORMATTERS } from 'core/utils/timeFormatters';
import { WERCKER_EXECUTION_DETAILS_CONTROLLER } from './werckerExecutionDetails.controller';
import { WERCKER_STAGE_ADD_PARAMETER_MODAL_CONTROLLER } from './modal/addParameter.controller.modal';
import { CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE } from '../stage.module';

export const WERCKER_STAGE_MODULE = 'spinnaker.core.pipeline.stage.wercker';
module(WERCKER_STAGE_MODULE, [
  WERCKER_STAGE,
  CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE,
  STAGE_COMMON_MODULE,
  TIME_FORMATTERS,
  WERCKER_EXECUTION_DETAILS_CONTROLLER,
  WERCKER_STAGE_ADD_PARAMETER_MODAL_CONTROLLER,
]);
