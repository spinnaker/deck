'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.manualJudgment', [
  require('./manualJudgmentExecutionDetails.controller.js'),
  require('./modal/index.js'),
  require('./manualJudgmentStage.js'),
  require('./modal'),
]);
