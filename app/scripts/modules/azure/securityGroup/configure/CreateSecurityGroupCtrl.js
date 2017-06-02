'use strict';

const angular = require('angular');

import { ACCOUNT_SERVICE, TASK_MONITOR_BUILDER } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.azure.securityGroup.create.controller', [
    require('@uirouter/angularjs').default,
    TASK_MONITOR_BUILDER,
    require('../securityGroup.write.service.js'),
    ACCOUNT_SERVICE,
  ])

  .controller('azureCreateSecurityGroupCtrl', function ($scope, $uibModalInstance, $state, $controller, accountService,
                                                        taskMonitorBuilder, application, securityGroup, azureSecurityGroupWriter) {

    $scope.pages = {
      location: require('./createSecurityGroupProperties.html'),
      ingress: require('./createSecurityGroupIngress.html'),
    };

    var ctrl = this;
    $scope.isNew = true;
    $scope.state = {
      submitting: false,
      infiniteScroll: {
        numToAdd: 20,
        currentItems: 20,
      },
    };

    accountService.listAccounts('azure').then(function(accounts) {
      $scope.accounts = accounts;
      ctrl.accountUpdated();
    });

    ctrl.addMoreItems = function() {
      $scope.state.infiniteScroll.currentItems += $scope.state.infiniteScroll.numToAdd;
    };

    function onApplicationRefresh() {
      // If the user has already closed the modal, do not navigate to the new details view
      if ($scope.$$destroyed) {
        return;
      }
      $uibModalInstance.close();
      var newStateParams = {
        name: $scope.securityGroup.name,
        accountId: $scope.securityGroup.credentials || $scope.securityGroup.accountName,
        region: $scope.securityGroup.regions[0],
        provider: 'azure',
      };
      if (!$state.includes('**.securityGroupDetails')) {
        $state.go('.securityGroupDetails', newStateParams);
      } else {
        $state.go('^.securityGroupDetails', newStateParams);
      }
    }

    function onTaskComplete() {
      application.securityGroups.refresh();
      application.securityGroups.onNextRefresh($scope, onApplicationRefresh);
    }

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: 'Creating your security group',
      modalInstance: $uibModalInstance,
      onTaskComplete: onTaskComplete,
    });

    $scope.securityGroup = securityGroup;

    ctrl.accountUpdated = function() {
      accountService.getRegionsForAccount($scope.securityGroup.credentials).then(function(regions) {
        $scope.regions = regions;
        $scope.securityGroup.regions = regions;
        ctrl.updateName();
      });
    };

    ctrl.cancel = function () {
      $uibModalInstance.dismiss();
    };

    ctrl.updateName = function() {
      var securityGroup = $scope.securityGroup,
        name = application.name;
      if (securityGroup.detail) {
        name += '-' + securityGroup.detail;
      }
      securityGroup.name = name;
      $scope.namePreview = name;
    };

    ctrl.upsert = function () {
      $scope.taskMonitor.submit(
        function() {
          let params = {
            cloudProvider: 'azure',
            appName: application.name,
            securityGroupName: $scope.securityGroup.name,
            region: $scope.securityGroup.region,
            subnet : 'none',
            vpcId: 'null'
            };
          $scope.securityGroup.type = 'upsertSecurityGroup';

          return azureSecurityGroupWriter.upsertSecurityGroup($scope.securityGroup, application, 'Create', params);
        }
      );
    };

    ctrl.addRule = function(ruleset) {
      ruleset.push({ name: $scope.securityGroup.name + '-Rule' + ruleset.length,
        priority: ruleset.length == 0 ? 100 : 100 * (ruleset.length + 1),
        protocol: 'tcp',
        access: 'Allow',
        direction: 'InBound',
        sourceAddressPrefix: '*',
        sourcePortRange: '*',
        destinationAddressPrefix: '*',
        destinationPortRange: '80-80',
        startPort: 80,
        endPort: 80
      });
    };

    ctrl.portUpdated = function(ruleset, index) {
        ruleset[index].destinationPortRange =
            ruleset[index].startPort + '-' + ruleset[index].endPort;
    };

    ctrl.removeRule = function(ruleset, index) {
      ruleset.splice(index, 1);
    };

    ctrl.moveUp = function(ruleset, index) {
      if(index === 0)
        return;
      swapRules(ruleset, index, index - 1);
    };
    ctrl.moveDown = function(ruleset, index) {
      if(index === ruleset.length - 1)
        return;
      swapRules(ruleset, index, index + 1);
    };

    function swapRules(ruleset, a, b) {
      var temp, priorityA, priorityB;
      temp = ruleset[b];
      priorityA = ruleset[a].priority;
      priorityB = ruleset[b].priority;
      //swap elements
      ruleset[b] = ruleset[a];
      ruleset[a] = temp;
      //swap priorities
      ruleset[a].priority = priorityA;
      ruleset[b].priority = priorityB;
    }

    $scope.securityGroup.securityRules = [];
  });
