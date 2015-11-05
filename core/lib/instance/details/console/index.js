const angular = require('angular');

module.exports = angular.module('spinnaker.core.instance.details.console', [
  require('./consoleOutput.modal.controller.js'),
  require('./consoleOutputLink.directive.js'),
]);
