'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.azure.serverGroup.configure.wizard.capacity.zone.directive', [])
  .directive('azureZoneSelector', function() {
    return {
      restrict: 'E',
      templateUrl: require('./zoneSelector.directive.html'),
      scope: {},
      bindToController: {
        command: '=',
      },
      controllerAs: 'vm',
      controller: [
        '$scope',
        function($scope) {
          this.updateEnableInboundNAT = () => {
            if ($scope.vm.command.zonesEnabled) {
              $scope.vm.command.enableInboundNAT = false;
            }
          };
        },
      ],
    };
  });
