'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.pipeline.stage.canary.acaTaskMonitorStage', [])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      synthetic: true,
      key: 'monitorAcaTask',
      executionDetailsUrl: require('./acaTaskMonitorExecutionDetails.html'),
    });
  });
