'use strict';

const angular = require('angular');

import { ModalWizard } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.azure.serverGroup.configure.networkSettings.controller', [])
  .controller('azureServerGroupNetworkSettingsCtrl', function($scope) {
    ModalWizard.markClean('network-settings');

    this.networkSettingsChanged = function(item) {
      $scope.command.vnet = $scope.command.selectedVnet.name;
      $scope.command.subnet = item;
      ModalWizard.markComplete('network-settings');
    };

    this.getVnetName = function() {
      if ($scope.command.selectedVnet) {
        return $scope.command.selectedVnet.name;
      } else {
        return 'Virtual network was not selected';
      }
    };
  });
