const angular = require('angular');

module.exports = angular.module('spinnaker.core.modal.buttons', [
  require('./modalClose.directive.js'),
  require('./submitButton.directive.js'),
]);
