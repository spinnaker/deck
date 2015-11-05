'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.pipeline.stage.canary', [
  require('./canaryStage.js'),
  require('./canaryExecutionDetails.controller.js'),
  require('./canaryExecutionSummary.controller.js'),
  require('./canaryDeployment/canaryDeployment.module.js'),
  require('./canaryStage.transformer.js'),
  require('./canaryScore.directive.js'),
  require('./canaryStatus.directive.js'),
])
  .run(function(pipelineConfig, canaryStageTransformer) {
    pipelineConfig.registerTransformer(canaryStageTransformer);
  })
  .name;
