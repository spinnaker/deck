'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.details.dcos', [
  require('./details.controller.js'),
  require('./resize/resize.controller.js'),
]);
