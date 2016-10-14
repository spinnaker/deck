'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.openstack.accessSettings', [
  require('angular-ui-router'),
  require('angular-ui-bootstrap'),
  require('../../../../common/appCacheBackedMultiSelectField.directive.js'),
]).controller('openstackServerGroupAccessSettingsCtrl', function($scope, loadBalancerReader, securityGroupReader, networkReader, v2modalWizardService) {

  function updateFilter() {
    $scope.filter = {
      account: $scope.command.credentials,
      region: $scope.command.region
    };
  }

  $scope.$watch('command.credentials', updateFilter);
  $scope.$watch('command.region', updateFilter);
  updateFilter();

  $scope.$watch('accessSettings.$valid', function(newVal) {
    if (newVal) {
      v2modalWizardService.markClean('access-settings');
      v2modalWizardService.markComplete('access-settings');
    } else {
      v2modalWizardService.markIncomplete('access-settings');
    }
  });

});
