const angular = require('angular');

module.exports = angular.module('spinnaker.core.application.modal', [
  require('./createApplication.modal.controller.js'),
  require('./editApplication.controller.modal.js'),
  require('./platformHealthOverride.directive.js'),
  require('./platformHealthOverrideCheckbox.directive.html'),
]);
