'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.aws.securityGroups.controller', [
  require('../serverGroupConfiguration.service.js'),
  require('../../../../modal/wizard/modalWizard.service.js'),
  require('../../../../caches/infrastructureCaches.js'),
])
  .controller('awsServerGroupSecurityGroupsCtrl', function($scope, modalWizardService, awsServerGroupConfigurationService, infrastructureCaches) {
    modalWizardService.getWizard().markClean('security-groups');
    modalWizardService.getWizard().markComplete('security-groups');

    $scope.getSecurityGroupRefreshTime = function() {
      return infrastructureCaches.securityGroups.getStats().ageMax;
    };

    $scope.refreshSecurityGroups = function() {
      $scope.refreshing = true;
      awsServerGroupConfigurationService.refreshSecurityGroups($scope.command).then(function() {
        $scope.refreshing = false;
      });
    };

  }).name;
