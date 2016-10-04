'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.loadBalancer.gce.details.controller', [
  require('angular-ui-router'),
  require('../../../core/account/account.service.js'),
  require('../../../core/confirmationModal/confirmationModal.service.js'),
  require('../../../core/loadBalancer/loadBalancer.write.service.js'),
  require('../../../core/loadBalancer/loadBalancer.read.service.js'),
  require('../../../core/confirmationModal/confirmationModal.service.js'),
  require('../../../core/insight/insightFilterState.model.js'),
  require('../../../core/utils/selectOnDblClick.directive.js'),
  require('./hostAndPathRules/hostAndPathRulesButton.component.js'),
  require('./loadBalancerType/loadBalancerType.component.js'),
  require('../elSevenUtils.service.js'),
  require('./healthCheck/healthCheck.component.js'),
  require('../configure/choice/loadBalancerTypeToWizardMap.constant.js'),
  require('../configure/http/httpLoadBalancer.write.service.js'),
])
  .controller('gceLoadBalancerDetailsCtrl', function ($scope, $state, $uibModal, loadBalancer, app, InsightFilterStateModel,
                                                      confirmationModalService, accountService, elSevenUtils,
                                                      loadBalancerWriter, loadBalancerReader,
                                                      $q, loadBalancerTypeToWizardMap, gceHttpLoadBalancerWriter) {

    let application = app;

    $scope.state = {
      loading: true
    };

    $scope.InsightFilterStateModel = InsightFilterStateModel;

    function extractLoadBalancer() {
      $scope.loadBalancer = application.loadBalancers.data.filter(function (test) {
        var testVpc = test.vpcId || null;
        return test.name === loadBalancer.name && (test.region === loadBalancer.region || test.region === 'global') && test.account === loadBalancer.accountId && testVpc === loadBalancer.vpcId;
      })[0];

      if ($scope.loadBalancer) {
        return createDetailsLoader().then(function(details) {
          $scope.state.loading = false;
          var filtered = details.filter(function(test) {
            return test.vpcid === loadBalancer.vpcId || (!test.vpcid && !loadBalancer.vpcId);
          });
          if (filtered.length) {
            $scope.loadBalancer.elb = filtered[0];
            $scope.loadBalancer.account = loadBalancer.accountId;

            accountService.getCredentialsKeyedByAccount('gce').then(function(credentialsKeyedByAccount) {
              if (elSevenUtils.isElSeven($scope.loadBalancer)) {
                $scope.loadBalancer.elb.availabilityZones = [ 'All zones' ];
              } else {
                $scope.loadBalancer.elb.availabilityZones = _.find(credentialsKeyedByAccount[loadBalancer.accountId].regions, { name: loadBalancer.region }).zones.sort();
              }
            });
          }
          accountService.getAccountDetails(loadBalancer.accountId).then(function(accountDetails) {
            $scope.loadBalancer.logsLink =
              'https://console.developers.google.com/project/' + accountDetails.projectName + '/logs?service=compute.googleapis.com&minLogLevel=0&filters=text:' + $scope.loadBalancer.name;
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

    function createDetailsLoader () {
      if (elSevenUtils.isElSeven($scope.loadBalancer)) {
        var detailsPromises = $scope.loadBalancer.listeners.map((listener) => {
          return loadBalancerReader
            .getLoadBalancerDetails($scope.loadBalancer.provider, loadBalancer.accountId, $scope.loadBalancer.region, listener.name);
        });

        return $q.all(detailsPromises)
          .then((loadBalancers) => {
            loadBalancers = _.flatten(loadBalancers);
            var representativeLb = loadBalancers[0];
            representativeLb.dnsnames = loadBalancers.map((lb) => lb.dnsname);
            representativeLb.listenerDescriptions = _.flatten(loadBalancers.map((lb) => lb.listenerDescriptions));
            return [representativeLb];
          });

      } else {
        return loadBalancerReader
          .getLoadBalancerDetails($scope.loadBalancer.provider, loadBalancer.accountId, $scope.loadBalancer.region, $scope.loadBalancer.name);
      }
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

    this.editLoadBalancer = function editLoadBalancer() {
      let lbType = elSevenUtils.isElSeven($scope.loadBalancer) ? 'HTTP(S)' : 'Network';
      let wizard = loadBalancerTypeToWizardMap[lbType];

      $uibModal.open({
        templateUrl: wizard.editTemplateUrl,
        controller: `${wizard.controller} as ctrl`,
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

      var taskMonitor = {
        application: application,
        title: 'Deleting ' + loadBalancer.name,
        forceRefreshMessage: 'Refreshing application...',
        forceRefreshEnabled: true
      };

      var submitMethod;
      if (elSevenUtils.isElSeven($scope.loadBalancer)) {
        submitMethod = function () {
          return gceHttpLoadBalancerWriter.deleteLoadBalancers($scope.loadBalancer, application);
        };
      } else {
        submitMethod = function () {
          loadBalancer.providerType = $scope.loadBalancer.provider;
          return loadBalancerWriter.deleteLoadBalancer(loadBalancer, application, {
            loadBalancerName: loadBalancer.name,
            region: $scope.loadBalancer.region,
            loadBalancerType: $scope.loadBalancer.loadBalancerType || 'NETWORK',
          });
        };
      }


      confirmationModalService.confirm({
        header: 'Really delete ' + loadBalancer.name + '?',
        buttonText: 'Delete ' + loadBalancer.name,
        provider: 'gce',
        account: loadBalancer.accountId,
        applicationName: application.name,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.isElSeven = elSevenUtils.isElSeven;
  }
);
