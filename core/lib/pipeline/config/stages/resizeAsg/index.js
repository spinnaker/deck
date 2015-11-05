'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.resizeAsg', [
  require('./resizeAsgStage.js'),
  require('../../../../account'),
  require('./gce'),
  require('./aws'),
  require('./cf'),
]);
