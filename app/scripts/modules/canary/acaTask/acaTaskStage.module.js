'use strict';

const angular = require('angular');

import { CANARY_SCORE_COMPONENT } from '../canary/canaryScore.component';

module.exports = angular
  .module('spinnaker.canary.genericCanary', [
    require('./acaTaskStage').name,
    require('./acaTaskExecutionDetails.controller').name,
    require('./acaTaskStage.transformer').name,
    CANARY_SCORE_COMPONENT,
    require('../canary/canaryStatus.directive.js').name,
  ])
  .run(function(pipelineConfig, acaTaskTransformer) {
    pipelineConfig.registerTransformer(acaTaskTransformer);
  });
