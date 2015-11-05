'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.disableAsg', [
  require('./disableAsgStage.js'),
  require('../core'),
  require('../../../../account'),
  require('utils'),
  require('./aws'),
  require('./gce'),
]);
