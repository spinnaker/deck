const angular = require('angular');

module.exports = angular.module('spinnaker.core.delivery.executionBuild', [
  require('./buildDisplayName.filter.js'),
  require('./executionBuildNumber.directive.js'),

]);
