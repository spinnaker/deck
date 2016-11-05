'use strict';

let angular = require('angular');
import {ACCOUNT_SERVICE} from 'core/account/account.service';

module.exports = angular.module('spinnaker.gce.securityGroup.create.controller', [
  require('angular-ui-router'),
  ACCOUNT_SERVICE,
  require('core/cache/infrastructureCaches.js'),
  require('core/cache/cacheInitializer.js'),
  require('core/task/monitor/taskMonitorService.js'),
  require('core/securityGroup/securityGroup.read.service.js'),
])
  .controller('gceCreateSecurityGroupCtrl', function($scope, $uibModalInstance, $state, $controller,
                                                  accountService, securityGroupReader,
                                                  taskMonitorService, cacheInitializer, infrastructureCaches,
                                                  application, securityGroup ) {

    $scope.pages = {
      location: require('./createSecurityGroupProperties.html'),
      ingress: require('./createSecurityGroupIngress.html'),
    };

    var ctrl = this;

    securityGroup.backingData = {};
    securityGroup.network = 'default';
    securityGroup.sourceRanges = [];
    securityGroup.ipIngress = [];

    angular.extend(this, $controller('gceConfigSecurityGroupMixin', {
      $scope: $scope,
      $uibModalInstance: $uibModalInstance,
      application: application,
      securityGroup: securityGroup,
    }));


    accountService.listAccounts('gce').then(function(accounts) {
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

  });
