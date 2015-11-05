'use strict';

let angular = require('angular');

require('./pipelineConfig.less');

module.exports = angular.module('spinnaker.core.pipeline.config', [
  require('../../delivery'),
  require('./pipelineConfig.controller.js'),
  require('./pipelineConfigView.js'),
  require('./pipelineConfigurer.js'),
  require('./actions'),
  require('./graph'),
  require('./services'),
  require('./stages'),
  require('./triggers'),
  require('./parameters'),
  require('./validation'),
  require('./targetSelect.directive.js'),
]);
