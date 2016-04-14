'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.loadBalancer.kubernetes.create.controller', [
  require('angular-ui-router'),
  require('../../../../core/loadBalancer/loadBalancer.write.service.js'),
  require('../../../../core/loadBalancer/loadBalancer.read.service.js'),
  require('../../../../core/account/account.service.js'),
  require('../../../../core/modal/wizard/v2modalWizard.service.js'),
  require('../../../../core/task/monitor/taskMonitorService.js'),
  require('../../../../core/search/search.service.js'),
  require('../../../namespace/selectField.directive.js'),
  require('../../transformer.js'),
])
  .controller('kubernetesUpsertLoadBalancerController', function($scope, $uibModalInstance, $state,
                                                                 application, loadBalancer, isNew, loadBalancerReader,
                                                                 accountService, kubernetesLoadBalancerTransformer,
                                                                 _, searchService, v2modalWizardService, loadBalancerWriter, taskMonitorService) {
    var ctrl = this;
    $scope.isNew = isNew;

    $scope.pages = {
      basicSettings: require('./basicSettings.html'),
      ports: require('./ports.html'),
      advancedSettings: require('./advancedSettings.html'),
    };

    $scope.state = {
      accountsLoaded: false,
      loadBalancerNamesLoaded: false,
      submitting: false
    };

    function onApplicationRefresh() {
      // If the user has already closed the modal, do not navigate to the new details view
      if ($scope.$$destroyed) {
        return;
      }
      $uibModalInstance.close();
      var newStateParams = {
        name: $scope.loadBalancer.name,
        accountId: $scope.loadBalancer.account,
        region: $scope.loadBalancer.region,
        provider: 'kubernetes',
      };
      if (!$state.includes('**.loadBalancerDetails')) {
        $state.go('.loadBalancerDetails', newStateParams);
      } else {
        $state.go('^.loadBalancerDetails', newStateParams);
      }
    }

    function onTaskComplete() {
      application.loadBalancers.refresh();
      application.loadBalancers.onNextRefresh($scope, onApplicationRefresh);
    }

    $scope.taskMonitor = taskMonitorService.buildTaskMonitor({
      application: application,
      title: (isNew ? 'Creating ' : 'Updating ') + 'your load balancer',
      modalInstance: $uibModalInstance,
      onTaskComplete: onTaskComplete,
    });

    var allLoadBalancerNames = {};

    function initializeEditMode() {
    }

    function initializeCreateMode() {
      accountService.listAccounts('kubernetes').then(function (accounts) {
        $scope.accounts = accounts;
        $scope.state.accountsLoaded = true;

        var accountNames = _.pluck($scope.accounts, 'name');
        if (accountNames.length && accountNames.indexOf($scope.loadBalancer.account) === -1) {
          $scope.loadBalancer.account = accountNames[0];
        }

        ctrl.accountUpdated();
      });
    }

    function initializeLoadBalancerNames() {
      loadBalancerReader.listLoadBalancers('kubernetes').then(function (loadBalancers) {
        loadBalancers.forEach((loadBalancer) => {
          let account = loadBalancer.account;
          if (!allLoadBalancerNames[account]) {
            allLoadBalancerNames[account] = {};
          }
          let namespace = loadBalancer.namespace;
          if (!allLoadBalancerNames[account][namespace]) {
            allLoadBalancerNames[account][namespace] = [];
          }
          allLoadBalancerNames[account][namespace].push(loadBalancer.name);
        });

        updateLoadBalancerNames();
        $scope.state.loadBalancerNamesLoaded = true;
      });
    }

    function updateLoadBalancerNames() {
      var account = $scope.loadBalancer.account;

      if (allLoadBalancerNames[account]) {
        $scope.existingLoadBalancerNames = _.flatten(_.map(allLoadBalancerNames[account]));
      } else {
        $scope.existingLoadBalancerNames = [];
      }
    }

    // initialize controller
    if (loadBalancer) {
      $scope.loadBalancer = kubernetesLoadBalancerTransformer.convertLoadBalancerForEditing(loadBalancer);
      initializeEditMode();
      initializeCreateMode();
    } else {
      $scope.loadBalancer = kubernetesLoadBalancerTransformer.constructNewLoadBalancerTemplate();
      initializeLoadBalancerNames();
      initializeCreateMode();
    }

    // Controller API
    this.updateName = function() {
      $scope.loadBalancer.name = this.getName();
    };

    this.getName = function() {
      var loadBalancer = $scope.loadBalancer;
      var loadBalancerName = [application.name, (loadBalancer.stack || ''), (loadBalancer.detail || '')].join('-');
      return _.trimRight(loadBalancerName, '-');
    };

    this.accountUpdated = function() {
      accountService.getAccountDetails($scope.loadBalancer.account).then(function(details) {
        $scope.namespaces = details.namespaces;
        ctrl.namespaceUpdated();
      });
    };

    this.namespaceUpdated = function() {
      updateLoadBalancerNames();
      ctrl.updateName();
    };

    this.submit = function () {
      var descriptor = isNew ? 'Create' : 'Update';

      this.updateName();
      $scope.taskMonitor.submit(
        function() {
          var zones = {};
          // TODO(lwander) make generic Q2 2016
          zones[$scope.loadBalancer.namespace] = [$scope.loadBalancer.namespace];
          let params = {
            cloudProvider: 'kubernetes',
            availabilityZones: zones
          };
          return loadBalancerWriter.upsertLoadBalancer($scope.loadBalancer, application, descriptor, params);
        }
      );
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };
  });
