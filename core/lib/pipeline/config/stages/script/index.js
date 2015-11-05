'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.script', [
  require('./scriptStage.js'),
  require('./scriptExecutionDetails.controller.js'),
  require('./aws'),
  require('./gce'),
]);
