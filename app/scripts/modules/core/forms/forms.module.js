'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.forms', [
  require('./autofocus/autofocus.directive.js'),
  require('./checklist/checklist.directive.js'),
]);
