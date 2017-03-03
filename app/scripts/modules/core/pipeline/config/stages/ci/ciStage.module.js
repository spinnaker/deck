'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.ci', [
  require('./ciStage.js'),
  require('../stage.module.js'),
  require('../core/stage.core.module.js'),
  require('core/utils/timeFormatters.js'),
  require('core/ci/igor.service.js'),
  require('./ciExecutionDetails.controller.js'),
]);
