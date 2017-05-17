'use strict';

const angular = require('angular');

import {ENABLE_ASG_EXECUTION_DETAILS_CTRL} from './templates/enableAsgExecutionDetails.controller';

module.exports = angular.module('spinnaker.core.pipeline.stage.enableAsg', [
  require('./enableAsgStage.js'),
  ENABLE_ASG_EXECUTION_DETAILS_CTRL,
]);
