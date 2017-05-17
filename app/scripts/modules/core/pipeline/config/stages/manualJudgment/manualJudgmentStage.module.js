'use strict';

const angular = require('angular');

import './manualJudgmentExecutionDetails.less';

module.exports = angular.module('spinnaker.core.pipeline.stage.manualJudgment', [
  require('../stage.module.js'),
  require('../core/stage.core.module.js'),
  require('./manualJudgmentExecutionDetails.controller.js'),
  require('./manualJudgmentStage.js'),
  require('../../../../notification/modal/editNotification.controller.modal.js'),
]);
