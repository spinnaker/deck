'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.securityGroup.aws.create.controller', [
  require('angular-ui-router'),
  require('../../../account/accountService.js'),
  require('cache:infrastructure'),
  require('../../../caches/cacheInitializer.js'),
  require('../../../tasks/monitor/taskMonitorService.js'),
  require('../../securityGroup.read.service.js'),
  require('../../../vpc/vpc.read.service.js'),
])
  .controller('CreateSecurityGroupCtrl', function($scope, $modalInstance, $state, $controller,
                                                  accountService, securityGroupReader,
                                                  taskMonitorService, cacheInitializer, infrastructureCaches,
                                                  _, application, securityGroup ) {

    var ctrl = this;

    angular.extend(this, $controller('ConfigSecurityGroupMixin', {
      $scope: $scope,
      $modalInstance: $modalInstance,
      application: application,
      securityGroup: securityGroup,
    }));


    accountService.listAccounts('aws').then(function(accounts) {
      $scope.accounts = accounts;
      ctrl.accountUpdated();
    });

    this.getSecurityGroupRefreshTime = function() {
      return infrastructureCaches.securityGroups.getStats().ageMax;
    };


    ctrl.upsert = function () {
      ctrl.mixinUpsert('Create');
    };

    ctrl.initializeSecurityGroups();

  }).name;
