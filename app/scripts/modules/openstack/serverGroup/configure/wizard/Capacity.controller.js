'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.openstack.serverGroup.configure.capacity', [])
  .controller('openstackServerGroupCapacityCtrl', function(modalWizardService) {
    modalWizardService.getWizard().markClean('capacity');
    modalWizardService.getWizard().markComplete('capacity');
  });
