'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.applicationBootstrap', [
  require('../navigation'),
])
.directive('spinnaker', function() {
  return {
    restrict: 'E',
    templateUrl: require('./applicationBootstrap.directive.html'),
    controller: function(templateOverrideRegistry) {
      this.spinnakerHeaderTemplate = templateOverrideRegistry.getTemplate('spinnakerHeader', require('./spinnakerHeader.html'));
    },
    controllerAs: 'applicationBootstrapCtrl',
  };
});
