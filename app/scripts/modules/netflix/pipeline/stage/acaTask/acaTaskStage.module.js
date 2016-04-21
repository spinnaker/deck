'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.pipeline.stage.genericCanary', [
  require('./acaTaskStage'),
  require('../../../../core/utils/lodash.js'),
  require('../../../../core/serverGroup/serverGroup.read.service.js'),
  require('./acaTaskStage.transformer'),
  require('../canary/canaryScore.directive.js'),
  require('../canary/canaryStatus.directive.js'),
  require('../../../../core/account/account.service.js'),
  require('../../../../core/naming/naming.service.js'),
  require('./acaTaskMonitor/acaTaskMonitor.module')
])
  .run(function(pipelineConfig, acaTaskTransformer) {
    pipelineConfig.registerTransformer(acaTaskTransformer);
  });
