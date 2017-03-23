'use strict';

let angular = require('angular');

import {TIME_FILTERS} from 'core/utils/filters';

module.exports = angular.module('spinnaker.core.pipeline.stage.jenkins', [
  require('./jenkinsStage.js'),
  require('../stage.module.js'),
  require('../core/stage.core.module.js'),
  TIME_FILTERS,
  require('core/ci/jenkins/igor.service.js'),
  require('./jenkinsExecutionDetails.controller.js'),
]);
