const angular = require('angular');

module.exports = angular.module('spinnaker.core.cloudProvider', [
  require('./cloudProvider.registry.js'),
  require('./cloudProviderLogo.directive.js'),
  require('./serviceDelegate.service.js'),
  require('./providerSelection'),
]);
