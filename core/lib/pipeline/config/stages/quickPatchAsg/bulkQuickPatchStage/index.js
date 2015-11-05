'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.quickPatchAsg.bulkQuickPatch', [
  require('./bulkQuickPatchStage.js'),
  require('../../../../../account'),
  require('./bulkQuickPatchStageExecutionDetails.controller.js'),
]);
