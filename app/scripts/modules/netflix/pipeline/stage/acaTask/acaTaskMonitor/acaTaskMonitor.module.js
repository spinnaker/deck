'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.pipeline.stage.canary.acaTaskMonitor', [
  require('./acaTaskMonitorStage'),
  require('./acaTaskExecutionDetails.controller'),
]);
