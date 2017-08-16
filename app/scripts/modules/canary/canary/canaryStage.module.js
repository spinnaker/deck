'use strict';

const angular = require('angular');

import { ACCOUNT_SERVICE, NAMING_SERVICE, CANARY_SCORE_COMPONENT } from '@spinnaker/core';

module.exports = angular.module('spinnaker.canary.stage', [
  require('./canaryStage.js'),
  require('./canaryExecutionDetails.controller.js'),
  require('./canaryExecutionSummary.controller.js'),
  require('./canaryDeployment/canaryDeployment.module.js'),
  require('./canaryStage.transformer.js'),
  CANARY_SCORE_COMPONENT,
  require('./canaryStatus.directive.js'),
  ACCOUNT_SERVICE,
  NAMING_SERVICE,
])
  .run(function(pipelineConfig, canaryStageTransformer) {
    pipelineConfig.registerTransformer(canaryStageTransformer);
  });
