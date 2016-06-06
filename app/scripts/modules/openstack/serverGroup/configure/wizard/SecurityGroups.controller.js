
'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.openstack.serverGroup.configure.securityGroups', [])
  .controller('openstackServerGroupSecurityGroupsCtrl', function(modalWizardService) {
    modalWizardService.getWizard().markClean('security-groups');
    modalWizardService.getWizard().markComplete('security-groups');
  });
