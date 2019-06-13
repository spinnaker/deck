'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.azure.serverGroup.configure.wizard.advancedSettings.selector.directive', [])
  .directive('azureServerGroupAdvancedSettingsSelector', function() {
    return {
      restrict: 'E',
      templateUrl: require('./advancedSettingsSelector.directive.html'),
      scope: {},
      bindToController: {
        command: '=',
      },
      controllerAs: 'adv',
      controller: 'azureServerGroupAdvancedSettingsSelectorCtrl',
    };
  })
  .controller('azureServerGroupAdvancedSettingsSelectorCtrl', function() {
    this.addPersistentDisk = () => {
      var newDataDisks = angular.copy(this.command.dataDisks);
      this.command.dataDisks = newDataDisks.concat([
        {
          lun: 0,
          managedDisk: {
            storageAccountType: 'Standard_LRS',
          },
          diskSizeGB: 1,
          caching: 'None',
          createOption: 'Empty',
        },
      ]);
    };

    this.removePersistentDisk = index => {
      var newDataDisks = angular.copy(this.command.dataDisks);
      this.command.dataDisks = newDataDisks.splice(index, 1);
    };
  });
