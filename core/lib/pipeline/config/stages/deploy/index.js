'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.deploy', [
  require('utils'),
  require('./cf'),
  require('./deployStage.js'),
  require('./deployStage.transformer.js'),
  require('./deployExecutionDetails.controller.js'),
  require('./clusterName.filter.js'),
  require('../core'),
  require('../../../../deploymentStrategy'),
  require('../../../../account'),
])
  .run(function(pipelineConfig, deployStageTransformer) {
    pipelineConfig.registerTransformer(deployStageTransformer);
  });
