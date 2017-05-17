'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.pipelines.stage.checkPreconditions', [
  require('../stage.module.js'),
  require('../core/stage.core.module.js'),
  require('./checkPreconditionsStage.js'),
]);
