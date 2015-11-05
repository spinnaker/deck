'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.enableAsg', [
  require('./enableAsgStage.js'),
  require('../core'),
  require('../../../../account'),
  require('utils'),
  require('./gce'),
  require('./aws'),
]);
