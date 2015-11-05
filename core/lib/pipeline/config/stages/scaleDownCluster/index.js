'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.scaleDownCluster', [
  require('./scaleDownClusterStage.js'),
  require('./scaleDownClusterExecutionDetails.controller.js'),
  require('utils'),
]);
