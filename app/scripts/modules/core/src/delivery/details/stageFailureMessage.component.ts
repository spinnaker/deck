import { module } from 'angular';
import { react2angular } from 'react2angular';

import { StageFailureMessage } from './StageFailureMessage';

export const STAGE_FAILURE_MESSAGE_COMPONENT = 'spinnaker.core.delivery.stageFailureMessage.component';
module(STAGE_FAILURE_MESSAGE_COMPONENT, [])
  .component('stageFailureMessage', react2angular(StageFailureMessage, ['message', 'messages', 'stage']));
