'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.shrinkCluster', [
  require('./shrinkClusterStage.js'),
  require('../index.js'),
  require('../core/index.js'),
  require('../../../../account/index.js'),
  require('utils/lodash.js'),
]);
