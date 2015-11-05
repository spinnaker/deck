'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.pipelines.stage.checkPreconditions', [
  require('./checkPreconditionsExecutionDetails.controller.js'),
  require('./checkPreconditionsStage.js'),
]);
