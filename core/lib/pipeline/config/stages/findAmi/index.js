'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.findAmi', [
  require('./findAmiStage.js'),
  require('../../../../account'),
  require('utils/lodash.js'),
  require('./aws'),
  require('./gce'),
]);
