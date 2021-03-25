'use strict';

import { module } from 'angular';

export const CORE_PIPELINE_CONFIG_STAGES_ALLOWIGNOREFAILURE_ALLOWIGNOREFAILURE_DIRECTIVE =
  'spinnaker.core.pipeline.stage.allowIgnoreFailure.directive';
export const name = CORE_PIPELINE_CONFIG_STAGES_ALLOWIGNOREFAILURE_ALLOWIGNOREFAILURE_DIRECTIVE; // for backwards compatibility
module(CORE_PIPELINE_CONFIG_STAGES_ALLOWIGNOREFAILURE_ALLOWIGNOREFAILURE_DIRECTIVE, []).component(
  'allowIgnoreFailure',
  {
    bindings: {
      stage: '<',
    },
    templateUrl: require('./allowIgnoreFailure.directive.html'),
  },
);
