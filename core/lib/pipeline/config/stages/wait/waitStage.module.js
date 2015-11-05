'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.wait', [
  require('./waitStage.js'),
  require('../index.js'),
  require('../core/index.js'),
  require('./waitExecutionDetails.controller.js'),
]);
