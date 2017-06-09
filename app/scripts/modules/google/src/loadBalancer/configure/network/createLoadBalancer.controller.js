'use strict';

const angular = require('angular');

import {
  ACCOUNT_SERVICE,
  LOAD_BALANCER_WRITE_SERVICE,
  TASK_MONITOR_BUILDER,
  V2_MODAL_WIZARD_SERVICE
} from '@spinnaker/core';

module.exports = angular.module('spinnaker.loadBalancer.gce.create.controller', [
  require('@uirouter/angularjs').default,
  LOAD_BALANCER_WRITE_SERVICE,
  ACCOUNT_SERVICE,
  require('../../loadBalancer.transformer.js'),
  V2_MODAL_WIZARD_SERVICE,
  TASK_MONITOR_BUILDER,
  require('../../../gceRegionSelectField.directive.js'),
])
  .controller('gceCreateLoadBalancerCtrl', function($scope, $uibModalInstance, $state,
                                                    accountService, gceLoadBalancerTransformer,
                                                    application, loadBalancer, isNew,
                                                    v2modalWizardService, loadBalancerWriter, taskMonitorBuilder) {

    var ctrl = this;

    $scope.isNew = isNew;

    $scope.pages = {
      location: require('./createLoadBalancerProperties.html'),
      listeners: require('./listeners.html'),
      healthCheck: require('./healthCheck.html'),
      advancedSettings: require('./advancedSettings.html'),
    };

    $scope.state = {
      accountsLoaded: false,
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
        accountId: $scope.loadBalancer.credentials,
        region: $scope.loadBalancer.region,
        provider: 'gce',
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

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: (isNew ? 'Creating ' : 'Updating ') + 'your load balancer',
      modalInstance: $uibModalInstance,
      onTaskComplete: onTaskComplete,
    });

    function initializeEditMode() {
    }

    function initializeCreateMode() {
      accountService.listAccounts('gce').then(function (accounts) {
        $scope.accounts = accounts;
        $scope.state.accountsLoaded = true;

        var accountNames = _.map($scope.accounts, 'name');
        if (accountNames.length && !accountNames.includes($scope.loadBalancer.credentials)) {
          $scope.loadBalancer.credentials = accountNames[0];
        }

        ctrl.accountUpdated();
      });
    }

    function updateLoadBalancerNames() {
      var account = $scope.loadBalancer.credentials;

      const accountLoadBalancersByRegion = {};
      application.getDataSource('loadBalancers').refresh(true).then(() => {
        application.getDataSource('loadBalancers').data.forEach((loadBalancer) => {
          if (loadBalancer.account === account) {
            accountLoadBalancersByRegion[loadBalancer.region] = accountLoadBalancersByRegion[loadBalancer.region] || [];
            accountLoadBalancersByRegion[loadBalancer.region].push(loadBalancer.name);
          }
        });

        $scope.existingLoadBalancerNames = _.flatten(_.map(accountLoadBalancersByRegion));
      });
    }

    // initialize controller
    if (loadBalancer) {
      $scope.loadBalancer = gceLoadBalancerTransformer.convertLoadBalancerForEditing(loadBalancer);
      initializeEditMode();
    } else {
      $scope.loadBalancer = gceLoadBalancerTransformer.constructNewLoadBalancerTemplate();
      updateLoadBalancerNames();
      initializeCreateMode();
    }

    // Controller API

    this.requiresHealthCheckPath = function () {
      return $scope.loadBalancer.healthCheckProtocol && $scope.loadBalancer.healthCheckProtocol.indexOf('HTTP') === 0;
    };

    this.prependForwardSlash = (text) => {
      return text && text.indexOf('/') !== 0 ? `/${text}` : text;
    };

    this.updateName = function() {
      $scope.loadBalancer.name = this.getName();
    };

    this.getName = function() {
      var loadBalancer = $scope.loadBalancer;
      var loadBalancerName = [application.name, (loadBalancer.stack || ''), (loadBalancer.detail || '')].join('-');
      return _.trimEnd(loadBalancerName, '-');
    };

    this.accountUpdated = function() {
      accountService.getRegionsForAccount($scope.loadBalancer.credentials).then(function(regions) {
        if (_.isArray(regions)) {
          $scope.regions = _.map(regions, 'name');
        } else {
          // TODO(duftler): Remove this once we finish deprecating the old style regions/zones in clouddriver GCE credentials.
          $scope.regions = _.keys(regions);
        }
        ctrl.regionUpdated();
      });
    };

    this.regionUpdated = function() {
      updateLoadBalancerNames();
      ctrl.updateName();
    };

    this.setVisibilityHealthCheckTab = function() {
      var wizard = v2modalWizardService;

      if ($scope.loadBalancer.listeners[0].healthCheck) {
        wizard.includePage('Health Check');
        wizard.markIncomplete('Health Check');
        wizard.includePage('Advanced Settings');
        wizard.markIncomplete('Advanced Settings');
      } else {
        wizard.excludePage('Health Check');
        wizard.markComplete('Health Check');
        wizard.excludePage('Advanced Settings');
        wizard.markComplete('Advanced Settings');
        wizard.markComplete('Listener');
      }
    };

    this.submit = function () {
      var descriptor = isNew ? 'Create' : 'Update';

      $scope.taskMonitor.submit(
        function() {
          let params = {
            cloudProvider: 'gce',
            loadBalancerName: $scope.loadBalancer.name,
          };

          if ($scope.loadBalancer.listeners && $scope.loadBalancer.listeners.length > 0) {
            let listener = $scope.loadBalancer.listeners[0];

            if (listener.protocol) {
              params.ipProtocol = listener.protocol;
            }

            if (listener.portRange) {
              params.portRange = listener.portRange;
            }

            if (listener.healthCheck) {
              params.healthCheck = {
                port: $scope.loadBalancer.healthCheckPort,
                requestPath: $scope.loadBalancer.healthCheckPath,
                timeoutSec: $scope.loadBalancer.healthTimeout,
                checkIntervalSec: $scope.loadBalancer.healthInterval,
                healthyThreshold: $scope.loadBalancer.healthyThreshold,
                unhealthyThreshold: $scope.loadBalancer.unhealthyThreshold,
              };
            } else {
              params.healthCheck = null;
            }
          }

          return loadBalancerWriter.upsertLoadBalancer($scope.loadBalancer, application, descriptor, params);
        }
      );
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };
  });
