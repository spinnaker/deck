'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.loadBalancer.gce.details.controller', [
  require('angular-ui-router'),
  require('../../../confirmationModal/confirmationModal.service.js'),
  require('../../loadBalancer.write.service.js'),
  require('../../loadBalancer.read.service.js'),
  require('utils:lodash'),
  require('../../../confirmationModal/confirmationModal.service.js'),
  require('../../../insight/insightFilterState.model.js'),
])
  .controller('gceLoadBalancerDetailsCtrl', function ($scope, $state, $exceptionHandler, $modal, loadBalancer, app, InsightFilterStateModel,
                                                      _, confirmationModalService, accountService, loadBalancerWriter, loadBalancerReader) {

    let application = app;

    $scope.state = {
      loading: true
    };

    $scope.InsightFilterStateModel = InsightFilterStateModel;

    function extractLoadBalancer() {
      $scope.loadBalancer = application.loadBalancers.filter(function (test) {
        var testVpc = test.vpcId || null;
        return test.name === loadBalancer.name && test.region === loadBalancer.region && test.account === loadBalancer.accountId && testVpc === loadBalancer.vpcId;
      })[0];

      if ($scope.loadBalancer) {
        var detailsLoader = loadBalancerReader.getLoadBalancerDetails($scope.loadBalancer.provider, loadBalancer.accountId, loadBalancer.region, loadBalancer.name);
        detailsLoader.then(function(details) {
          $scope.state.loading = false;
          var filtered = details.filter(function(test) {
            return test.vpcid === loadBalancer.vpcId || (!test.vpcid && !loadBalancer.vpcId);
          });
          if (filtered.length) {
            $scope.loadBalancer.elb = filtered[0];
            $scope.loadBalancer.account = loadBalancer.accountId;

            accountService.getRegionsKeyedByAccount('gce').then(function(regionsKeyedByAccount) {
              $scope.loadBalancer.elb.availabilityZones = regionsKeyedByAccount[loadBalancer.accountId].regions[loadBalancer.region].sort();
            });
          }
        });

        accountService.getAccountDetails(loadBalancer.accountId).then(function(accountDetails) {
          $scope.loadBalancer.logsLink =
            'https://console.developers.google.com/project/' + accountDetails.projectName + '/logs?service=compute.googleapis.com&minLogLevel=0&filters=text:' + $scope.loadBalancer.name;
        });
      }
      if (!$scope.loadBalancer) {
        $state.go('^');
      }
    }

    extractLoadBalancer();

    application.registerAutoRefreshHandler(extractLoadBalancer, $scope);

    //BEN_TODO

    this.editLoadBalancer = function editLoadBalancer() {
      var provider = $scope.loadBalancer.provider;
      $modal.open({
        templateUrl: 'app/scripts/modules/loadBalancers/configure/' + provider + '/editLoadBalancer.html',
        controller: provider + 'CreateLoadBalancerCtrl as ctrl',
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

      var taskMonitor = {
        application: application,
        title: 'Deleting ' + loadBalancer.name,
        forceRefreshMessage: 'Refreshing application...',
        forceRefreshEnabled: true
      };

      var submitMethod = function () {
        loadBalancer.providerType = $scope.loadBalancer.provider;
        return loadBalancerWriter.deleteLoadBalancer(loadBalancer, application);
      };

      confirmationModalService.confirm({
        header: 'Really delete ' + loadBalancer.name + '?',
        buttonText: 'Delete ' + loadBalancer.name,
        destructive: true,
        provider: 'gce',
        account: loadBalancer.accountId,
        applicationName: application.name,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

  }
).name;
