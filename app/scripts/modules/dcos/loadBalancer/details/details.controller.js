'use strict';

import { ACCOUNT_SERVICE, CONFIRMATION_MODAL_SERVICE, LOAD_BALANCER_WRITE_SERVICE, ServerGroupTemplates } from '@spinnaker/core';

const angular = require('angular');

module.exports = angular.module('spinnaker.dcos.loadBalancer.details.controller', [
  ACCOUNT_SERVICE,
  CONFIRMATION_MODAL_SERVICE,
  LOAD_BALANCER_WRITE_SERVICE
])
  .controller('dcosLoadBalancerDetailsController', function ($scope, $state, $uibModal, loadBalancer, app,
                                                                   confirmationModalService, accountService, loadBalancerWriter,
                                                                   dcosProxyUiService, $q) {

    let application = app;

    $scope.state = {
      loading: true
    };

    function extractLoadBalancer() {
      $scope.loadBalancer = application.loadBalancers.data.find(function (test) {
        return test.name === loadBalancer.name &&
          test.account === loadBalancer.accountId;
      });

      if ($scope.loadBalancer) {
        $scope.state.loading = false;
      } else {
        autoClose();
      }

      return $q.when(null);
    }

    this.uiLink = function uiLink() {
      return dcosProxyUiService.buildLoadBalancerLink($scope.loadBalancer.clusterUrl, $scope.loadBalancer.account, $scope.loadBalancer.name);
    };

    this.showJson = function showJson() {
      $scope.userDataModalTitle = 'Application JSON';
      $scope.userData = $scope.loadBalancer.json;
      $uibModal.open({
        templateUrl: ServerGroupTemplates.userData,
        controller: 'CloseableModalCtrl',
        scope: $scope
      });
    };

    function autoClose() {
      if ($scope.$$destroyed) {
        return;
      }
      $state.params.allowModalToStayOpen = true;
      $state.go('^', null, {location: 'replace'});
    }

    extractLoadBalancer().then(() => {
      // If the user navigates away from the view before the initial extractLoadBalancer call completes,
      // do not bother subscribing to the refresh
      if (!$scope.$$destroyed) {
        app.loadBalancers.onRefresh($scope, extractLoadBalancer);
      }
    });

    this.editLoadBalancer = function editLoadBalancer() {
      $uibModal.open({
        templateUrl: require('../configure/wizard/editWizard.html'),
        controller: 'dcosUpsertLoadBalancerController as ctrl',
        size: 'lg',
        resolve: {
          application: function() { return application; },
          loadBalancer: function() { return angular.copy($scope.loadBalancer); },
          isNew: function() { return false; }
        }
      });
    };

    this.deleteLoadBalancer = function deleteLoadBalancer() {
      if ($scope.loadBalancer.instances && $scope.loadBalancer.instances.length) {
        return;
      }

      const taskMonitor = {
        application: application,
        title: 'Deleting ' + loadBalancer.name,
      };

      const command = {
        cloudProvider: 'dcos',
        loadBalancerName: $scope.loadBalancer.name,
        dcosCluster: $scope.loadBalancer.dcosCluster,
        region: $scope.loadBalancer.region,
        credentials: $scope.loadBalancer.account
      };

      const submitMethod = () => loadBalancerWriter.deleteLoadBalancer(command, application);

      confirmationModalService.confirm({
        header: 'Really delete ' + loadBalancer.name + '?',
        buttonText: 'Delete ' + loadBalancer.name,
        provider: 'dcos',
        account: loadBalancer.account,
        applicationName: application.name,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };
  }
);
