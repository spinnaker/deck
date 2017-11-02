import { module } from 'angular';

import { MANUAL_JUDGMENT_SERVICE } from './manualJudgment.service';
import { STAGE_CORE_MODULE } from '../core/stage.core.module';

import './manualJudgmentExecutionDetails.less';

export const MANUAL_JUDGMENT_STAGE_MODULE = 'spinnaker.core.pipeline.stage.manualJudgment';

module(MANUAL_JUDGMENT_STAGE_MODULE, [
  require('../stage.module.js').name,
  MANUAL_JUDGMENT_SERVICE,
  STAGE_CORE_MODULE,
  require('./manualJudgmentStage.js').name,
  require('../../../../notification/modal/editNotification.controller.modal.js').name,
]);
