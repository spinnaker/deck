'use strict';

const angular = require('angular');

import { EXECUTION_WINDOW_ACTIONS_COMPONENT } from './executionWindowActions.component';

import './executionWindows.less';

module.exports = angular.module('spinnaker.core.pipeline.stage.executionWindows', [
  require('./executionWindowsStage.js').name,
  require('./executionWindows.transformer.js').name,
  require('./executionWindows.directive.js').name,
  EXECUTION_WINDOW_ACTIONS_COMPONENT,
  require('../stage.module.js').name,
  require('../core/stage.core.module.js').name,
]);
