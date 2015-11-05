'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.disableCluster', [
  require('./disableClusterStage.js'),
  require('../core'),
  require('../../../../account'),
  require('utils'),
  require('./aws'),
  require('./gce'),
]);
