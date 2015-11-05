'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.modifyScalingProcess', [
  require('./modifyScalingProcessStage.js'),
  require('../core'),
  require('../../../../account'),
  require('./modifyScalingProcessExecutionDetails.controller.js'),
]);
