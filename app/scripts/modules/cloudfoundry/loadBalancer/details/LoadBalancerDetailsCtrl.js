'use strict';

const angular = require('angular');

import {
  ACCOUNT_SERVICE,
  CONFIRMATION_MODAL_SERVICE,
  LOAD_BALANCER_READ_SERVICE,
  LOAD_BALANCER_WRITE_SERVICE
} from '@spinnaker/core';

module.exports = angular.module('spinnaker.loadBalancer.cf.details.controller', [
  require('@uirouter/angularjs').default,
  ACCOUNT_SERVICE,
  CONFIRMATION_MODAL_SERVICE,
  LOAD_BALANCER_WRITE_SERVICE,
  LOAD_BALANCER_READ_SERVICE,
])
  .controller('cfLoadBalancerDetailsCtrl', function ($scope, $state, $uibModal, loadBalancer, app,
                                                     confirmationModalService, accountService, loadBalancerWriter, loadBalancerReader, $q) {

    let application = app;

    $scope.state = {
      loading: true
    };

    function extractLoadBalancer() {
      $scope.loadBalancer = application.loadBalancers.data.filter(function (test) {
        var testVpc = test.vpcId || null;
        return test.name === loadBalancer.name && test.region === loadBalancer.region && test.account === loadBalancer.accountId && testVpc === loadBalancer.vpcId;
      })[0];

      if ($scope.loadBalancer) {
        var detailsLoader = loadBalancerReader.getLoadBalancerDetails($scope.loadBalancer.provider, loadBalancer.accountId, loadBalancer.region, loadBalancer.name);
        return detailsLoader.then(function(details) {
          $scope.state.loading = false;
          var filtered = details.filter(function(test) {
            return test.vpcid === loadBalancer.vpcId || (!test.vpcid && !loadBalancer.vpcId);
          });
          if (filtered.length) {
            $scope.loadBalancer.elb = filtered[0];
            $scope.loadBalancer.account = loadBalancer.accountId;

            accountService.getCredentialsKeyedByAccount('cf').then(function(credentialsKeyedByAccount) {
              $scope.loadBalancer.elb.availabilityZones = credentialsKeyedByAccount[loadBalancer.accountId].regions[loadBalancer.region].sort();
            });
          }
          accountService.getAccountDetails(loadBalancer.accountId).then(function() {
            // TODO link to logs
          });
        },
          autoClose
        );
      }
      if (!$scope.loadBalancer) {
        autoClose();
      }
      return $q.when(null);
    }

    function autoClose() {
      if ($scope.$$destroyed) {
        return;
      }
      $state.params.allowModalToStayOpen = true;
      $state.go('^', null, {location: 'replace'});
    }

    app.loadBalancers.ready().then(extractLoadBalancer).then(() => {
      // If the user navigates away from the view before the initial extractLoadBalancer call completes,
      // do not bother subscribing to the refresh
      if (!$scope.$$destroyed) {
        app.loadBalancers.onRefresh($scope, extractLoadBalancer);
      }
    });

    this.deleteLoadBalancer = function deleteLoadBalancer() {
      if ($scope.loadBalancer.instances && $scope.loadBalancer.instances.length) {
        return;
      }

      const taskMonitor = {
        application: application,
        title: 'Deleting ' + loadBalancer.name,
      };

      const command = {
        cloudProvider: 'cf',
        loadBalancerName: loadBalancer.name,
        credentials: loadBalancer.accountId,
        region: loadBalancer.region,
      };

      const submitMethod = () => loadBalancerWriter.deleteLoadBalancer(command, application);

      confirmationModalService.confirm({
        header: 'Really delete ' + loadBalancer.name + '?',
        buttonText: 'Delete ' + loadBalancer.name,
        provider: 'cf',
        account: loadBalancer.accountId,
        applicationName: application.name,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

  }
);
