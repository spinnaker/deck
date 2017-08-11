import { module } from 'angular';
import { react2angular } from 'react2angular';

import { CanaryScores } from './CanaryScores';

export const CANARY_SCORES_CONFIG_COMPONENT = 'spinnaker.core.canaryScores.component';
module(CANARY_SCORES_CONFIG_COMPONENT, [])
  .component('canaryScores', react2angular(CanaryScores, ['onChange', 'successfulHelpFieldId', 'successfulLabel', 'successfulScore', 'unhealthyHelpFieldId', 'unhealthyLabel', 'unhealthyScore']));
