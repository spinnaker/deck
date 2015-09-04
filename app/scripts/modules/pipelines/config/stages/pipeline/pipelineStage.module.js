'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.pipelines.stage.pipeline', [
  require('./pipelineStage.js'),
  require('../stage.module.js'),
  require('../core/stage.core.module.js'),
  require('../../../../caches/cacheInitializer.js'),
  require('cache:infrastructure'),
  require('../../../../utils/timeFormatters.js'),
  require('../../services/pipelineConfigService.js'),
  require('./pipelineExecutionDetails.controller.js'),
  require('../../../../applications/applications.read.service.js'),
]).name;
