'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.config', [])
  .constant('settings', window.spinnakerSettings);
