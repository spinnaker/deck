'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.pipeline', [
  require('./pipelineStage.js'),
  require('../../../../cache'),
  require('utils'),
  require('../../services'),
  require('./pipelineExecutionDetails.controller.js'),
  require('../../../../application'),
]);
