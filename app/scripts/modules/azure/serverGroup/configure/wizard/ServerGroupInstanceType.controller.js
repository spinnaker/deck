'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.azure.serverGroup.configure.instanceType.controller', [])
  .controller('azureInstanceTypeCtrl', [
    '$scope',
    'modalWizardService',
    function($scope, modalWizardService) {
      modalWizardService.getWizard().markComplete('instance-type');
      modalWizardService.getWizard().markClean('instance-type');
    },
  ]);
