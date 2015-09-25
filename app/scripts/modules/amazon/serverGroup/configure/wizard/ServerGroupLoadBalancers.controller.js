'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.aws.loadBalancer.controller', [
  require('../serverGroupConfiguration.service.js'),
  require('../../../../modal/wizard/modalWizard.service.js'),
  require('../../../../caches/infrastructureCaches.js'),
])
  .controller('awsServerGroupLoadBalancersCtrl', function($scope, modalWizardService, awsServerGroupConfigurationService, infrastructureCaches) {
    modalWizardService.getWizard().markClean('load-balancers');
    modalWizardService.getWizard().markComplete('load-balancers');

    $scope.getLoadBalancerRefreshTime = function() {
      return infrastructureCaches.loadBalancers.getStats().ageMax;
    };

    $scope.refreshLoadBalancers = function() {
      $scope.refreshing = true;
      awsServerGroupConfigurationService.refreshLoadBalancers($scope.command).then(function() {
        $scope.refreshing = false;
      });
    };
  }).name;
