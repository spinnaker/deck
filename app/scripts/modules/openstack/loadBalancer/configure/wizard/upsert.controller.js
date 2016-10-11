'use strict';

import modalWizardServiceModule from 'core/modal/wizard/v2modalWizard.service';

let angular = require('angular');
require('../../loadBalancer.less');

module.exports = angular.module('spinnaker.loadBalancer.openstack.create.controller', [
    require('angular-ui-router'),
    require('core/loadBalancer/loadBalancer.write.service.js'),
    require('core/loadBalancer/loadBalancer.read.service.js'),
    require('core/account/account.service.js'),
    modalWizardServiceModule,
    require('core/task/monitor/taskMonitorService.js'),
    require('core/search/search.service.js'),
    require('../../transformer.js'),
    require('../../../region/regionSelectField.directive.js'),
    require('../../../subnet/subnetSelectField.directive.js'),
    require('../../../network/networkSelectField.directive.js'),
    require('../../../common/isolateForm.directive.js'),
  ])
  .controller('openstackUpsertLoadBalancerController', function($scope, $uibModalInstance, $state,
                                                                application, loadBalancer, isNew, loadBalancerReader,
                                                                accountService, openstackLoadBalancerTransformer,
                                                                loadBalancerWriter, taskMonitorService) {
    var ctrl = this;
    $scope.isNew = isNew;
    $scope.application = application;

    $scope.application = application;

    $scope.pages = {
      location: require('./location.html'),
      interface: require('./interface.html'),
      listeners: require('./listeners.html'),
      healthCheck: require('./healthCheck.html'),
    };

    $scope.state = {
      accountsLoaded: false,
      loadBalancerNamesLoaded: false,
      submitting: false
    };

    $scope.subnetFilter = {};

    $scope.protocols = ['HTTP', 'HTTPS'];
    $scope.maxPort = 65535;
    $scope.methods = [
      { label: 'Round Robin', value: 'ROUND_ROBIN' },
      { label: 'Least Connections', value: 'LEAST_CONNECTIONS' },
      { label: 'Source IP', value: 'SOURCE_IP' }
    ];

    // initialize controller
    if (loadBalancer) {
      $scope.loadBalancer = openstackLoadBalancerTransformer.convertLoadBalancerForEditing(loadBalancer);
    } else {
      $scope.loadBalancer = openstackLoadBalancerTransformer.constructNewLoadBalancerTemplate();
      initializeLoadBalancerNames();
    }

    finishInitialization();

    function onApplicationRefresh() {
      // If the user has already closed the modal, do not navigate to the new details view
      if ($scope.$$destroyed) {
        return;
      }
      $uibModalInstance.close();
      var newStateParams = {
        provider: 'openstack',
        name: $scope.loadBalancer.name,
        accountId: $scope.loadBalancer.account,
        region: $scope.loadBalancer.region,
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

    function finishInitialization() {
      accountService.listAccounts('openstack').then(function (accounts) {
        $scope.accounts = accounts;
        $scope.state.accountsLoaded = true;

        var accountNames = _.map($scope.accounts, 'name');
        if (accountNames.length && !accountNames.includes($scope.loadBalancer.account)) {
          $scope.loadBalancer.account = accountNames[0];
        }

        ctrl.accountUpdated();
      });
    }

    function initializeLoadBalancerNames() {
      loadBalancerReader.listLoadBalancers('openstack').then(function (loadBalancers) {
        loadBalancers.forEach((loadBalancer) => {
          let account = loadBalancer.account;
          if (!allLoadBalancerNames[account]) {
            allLoadBalancerNames[account] = {};
          }
          let region = loadBalancer.region;
          if (!allLoadBalancerNames[account][region]) {
            allLoadBalancerNames[account][region] = [];
          }
          allLoadBalancerNames[account][region].push(loadBalancer.name);
        });

        $scope.state.loadBalancerNamesLoaded = true;
        updateLoadBalancerNames();
      });
    }

    function updateLoadBalancerNames() {
      $scope.existingLoadBalancerNames = _.flatten(_.map(allLoadBalancerNames[$scope.loadBalancer.account || ''] || []));
    }

    // Controller API
    this.updateName = function() {
      if (!isNew) {
        return;
      }

      var loadBalancer = $scope.loadBalancer;
      var loadBalancerName = [application.name, (loadBalancer.stack || ''), (loadBalancer.detail || '')].join('-');
      loadBalancer.name = _.trimEnd(loadBalancerName, '-');
    };

    this.accountUpdated = function() {
      ctrl.updateName();
      updateLoadBalancerNames();
    };

    this.onRegionChanged = function(regionId) {
      $scope.loadBalancer.region = regionId;

      //updating the filter triggers a refresh of the subnets
      $scope.subnetFilter = {type: 'openstack', account: $scope.loadBalancer.account, region: $scope.loadBalancer.region};
    };

    this.onDistributionChanged = function(distribution) {
      $scope.loadBalancer.algorithm = distribution;
    };

    this.newStatusCode = 200;
    this.addStatusCode = function() {
      var newCode = parseInt(this.newStatusCode);
      if (!$scope.loadBalancer.healthMonitor.expectedCodes.includes(newCode)) {
        $scope.loadBalancer.healthMonitor.expectedCodes.push(newCode);
        $scope.loadBalancer.healthMonitor.expectedCodes.sort();
      }
    };

    this.removeStatusCode = function(code) {
      $scope.loadBalancer.healthMonitor.expectedCodes = $scope.loadBalancer.healthMonitor.expectedCodes.filter(function(c) {
        return c !== code;
      });
    };

    this.prependForwardSlash = (text) => {
      return text && text.indexOf('/') !== 0 ? `/${text}` : text;
    };

    function updateFilter() {
      $scope.filter = {
        account: $scope.loadBalancer.account,
        region: $scope.loadBalancer.region
      };
    }

    $scope.$watch('loadBalancer.account', updateFilter);
    $scope.$watch('loadBalancer.region', updateFilter);
    updateFilter();

    this.removeListener = function(index) {
      $scope.loadBalancer.listeners.splice(index, 1);
    };

    this.addListener = function() {
      $scope.loadBalancer.listeners.push({externalProtocol: 'HTTP', externalPort: 80, internalPort: 80});
    };

    this.listenerProtocolChanged = (listener) => {
      if (listener.externalProtocol === 'TERMINATED_HTTPS') {
        listener.externalPort = 443;
        listener.internalPort = 443;
      }
      if (listener.externalProtocol === 'HTTP') {
        listener.externalPort = 80;
        listener.internalPort = 80;
      }
      if (listener.externalProtocol === 'TCP') {
        listener.externalPort = '';
        listener.internalPort = '';
      }
    };

    this.showSslCertificateIdField = function() {
      return $scope.loadBalancer.listeners.some(function(listener) {
        return listener.externalProtocol === 'TERMINATED_HTTPS';
      });
    };

    this.submit = function () {
      var descriptor = isNew ? 'Create' : 'Update';

      this.updateName();
      $scope.taskMonitor.submit(
        function() {
          let params = {
            cloudProvider: 'openstack',
            account: $scope.loadBalancer.accountId || $scope.loadBalancer.account,
            accountId: $scope.loadBalancer.accountId,
            securityGroups: $scope.loadBalancer.securityGroups
          };
          return loadBalancerWriter.upsertLoadBalancer(_.omit($scope.loadBalancer, 'accountId'), application, descriptor, params);
        }
      );
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };
  });
