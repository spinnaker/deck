import { module } from 'angular';

import { SCALING_POLICY_MODULE } from './scalingPolicy/scalingPolicy.module';

export const SERVER_GROUP_DETAILS_MODULE = 'spinnaker.amazon.serverGroup.details';
module(SERVER_GROUP_DETAILS_MODULE, [
  SCALING_POLICY_MODULE,
  require('./serverGroupDetails.aws.controller.js').name,
  require('./scalingProcesses/autoScalingProcess.service.js').name,
  require('./scalingProcesses/modifyScalingProcesses.controller.js').name,
  require('./scheduledAction/editScheduledActions.modal.controller.js').name,
  require('./advancedSettings/editAsgAdvancedSettings.modal.controller.js').name,
]);
