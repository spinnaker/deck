const angular = require('angular');

module.exports = angular.module('spinnaker.core.delivery.details', [
  require('./executionDetails.controller.js'),
  require('./executionDetails.directive.js'),
  require('./executionDetailsSection.service.js'),
  require('./executionDetailsSectionNav.directive.js'),
]);

