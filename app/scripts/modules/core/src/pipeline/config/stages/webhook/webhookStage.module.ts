import {module} from 'angular';

import {WEBHOOK_STAGE} from './webhookStage';
import {IGOR_SERVICE} from 'core/ci/igor.service';
import {TIME_FORMATTERS} from 'core/utils/timeFormatters';
import {WEBHOOK_EXECUTION_DETAILS_CONTROLLER} from './webhookExecutionDetails.controller';
import {WEBHOOK_STAGE_ADD_CUSTOM_HEADER_MODAL_CONTROLLER} from './modal/addCustomHeader.controller.modal';

export const WEBHOOK_STAGE_MODULE = 'spinnaker.core.pipeline.stage.webhook';
module(WEBHOOK_STAGE_MODULE, [
  WEBHOOK_STAGE,
  require('../stage.module.js'),
  require('../core/stage.core.module.js'),
  TIME_FORMATTERS,
  IGOR_SERVICE,
  WEBHOOK_EXECUTION_DETAILS_CONTROLLER,
  WEBHOOK_STAGE_ADD_CUSTOM_HEADER_MODAL_CONTROLLER,
]);
