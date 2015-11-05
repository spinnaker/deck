'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.quickPatchAsg', [
  require('./quickPatchAsgStage.js'),
  require('../../../../account'),
  require('./quickPatchAsgExecutionDetails.controller.js')
]);
