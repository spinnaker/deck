'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.forms', [
  require('./autofocus'),
  require('./checklist'),
]);
