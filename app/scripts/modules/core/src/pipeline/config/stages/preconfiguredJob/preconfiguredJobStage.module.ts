import { module } from 'angular';

import { PRECONFIGUREDJOB_STAGE } from './preconfiguredJobStage';
import { STAGE_CORE_MODULE } from '../core/stage.core.module';
import { TIME_FORMATTERS } from 'core/utils/timeFormatters';

export const PRECONFIGUREDJOB_STAGE_MODULE = 'spinnaker.core.pipeline.stage.preconfiguredjob';
module(PRECONFIGUREDJOB_STAGE_MODULE, [
  PRECONFIGUREDJOB_STAGE,
  require('../stage.module.js').name,
  STAGE_CORE_MODULE,
  TIME_FORMATTERS,
]);
