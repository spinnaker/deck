'use strict';

let angular = require('angular');

import {TIME_FILTERS} from 'core/utils/filters';

module.exports = angular.module('spinnaker.core.pipeline.stage.pipeline', [
  require('./pipelineStage.js'),
  require('../stage.module.js'),
  require('../core/stage.core.module.js'),
  TIME_FILTERS,
  require('./pipelineExecutionDetails.controller.js'),
  require('core/widgets/spelText/spelSelect.component'),
]);
