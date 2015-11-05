'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.destroyAsgStage', [
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      useBaseProvider: true,
      key: 'destroyServerGroup',
      label: 'Destroy Server Group',
      description: 'Destroys a server group'
    });
  });
