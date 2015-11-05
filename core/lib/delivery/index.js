'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.delivery', [
  require('../cache'),
  require('./filter'),
  require('./executions'),
  require('./status'),
  require('./executionBuild'),
  require('./executionGroup'),
  require('./details'),
  require('./stageFailureMessage'),
  require('./manualExecution'),
  require('./create'),
  require('./triggers'),
  require('./service'),
  require('./states.js'),
]);
