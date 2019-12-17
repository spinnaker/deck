import { module } from 'angular';

import { TRAVIS_STAGE } from './travisStage';
import { STAGE_COMMON_MODULE } from '../common/stage.common.module';
import { TIME_FORMATTERS } from 'core/utils/timeFormatters';
import { TRAVIS_EXECUTION_DETAILS_CONTROLLER } from './travisExecutionDetails.controller';
import { TRAVIS_STAGE_ADD_PARAMETER_MODAL_CONTROLLER } from './modal/addParameter.controller.modal';
import { CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE } from '../stage.module';

export const TRAVIS_STAGE_MODULE = 'spinnaker.core.pipeline.stage.travis';
module(TRAVIS_STAGE_MODULE, [
  TRAVIS_STAGE,
  CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE,
  STAGE_COMMON_MODULE,
  TIME_FORMATTERS,
  TRAVIS_EXECUTION_DETAILS_CONTROLLER,
  TRAVIS_STAGE_ADD_PARAMETER_MODAL_CONTROLLER,
]);
