'use strict';

import _ from 'lodash';
import {DELETE_MODAL_CONTROLLER} from './deleteModal/deleteModal.controller';
import {GCE_BACKEND_SERVICE_DETAILS_COMPONENT} from './backendService/backendService.component';
import {SESSION_AFFINITY_FILTER} from './backendService/sessionAffinity.filter';
import {GCE_LOAD_BALANCER_TYPE_TO_WIZARD_CONSTANT} from '../configure/choice/loadBalancerTypeToWizardMap.constant';
import {ACCOUNT_SERVICE} from 'core/account/account.service';

let angular = require('angular');

module.exports = angular.module('spinnaker.loadBalancer.gce.details.controller', [
  require('angular-ui-router'),
  ACCOUNT_SERVICE,
  require('core/confirmationModal/confirmationModal.service.js'),
  require('core/loadBalancer/loadBalancer.write.service.js'),
  require('core/loadBalancer/loadBalancer.read.service.js'),
  require('core/confirmationModal/confirmationModal.service.js'),
  require('core/insight/insightFilterState.model.js'),
  require('core/utils/selectOnDblClick.directive.js'),
  require('./hostAndPathRules/hostAndPathRulesButton.component.js'),
  require('./loadBalancerType/loadBalancerType.component.js'),
  require('../elSevenUtils.service.js'),
  require('./healthCheck/healthCheck.component.js'),
  require('core/help/helpField.directive.js'),
  GCE_BACKEND_SERVICE_DETAILS_COMPONENT,
  DELETE_MODAL_CONTROLLER,
  SESSION_AFFINITY_FILTER,
  GCE_LOAD_BALANCER_TYPE_TO_WIZARD_CONSTANT,
])
  .controller('gceLoadBalancerDetailsCtrl', function ($scope, $state, $uibModal, loadBalancer, app, InsightFilterStateModel,
                                                      confirmationModalService, accountService, elSevenUtils,
                                                      loadBalancerWriter, loadBalancerReader,
                                                      $q, loadBalancerTypeToWizardMap) {

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

            accountService.getCredentialsKeyedByAccount('gce').then(function() {
              if (elSevenUtils.isElSeven($scope.loadBalancer)) {
                $scope.loadBalancer.elb.backendServices = getBackendServices($scope.loadBalancer);
                $scope.loadBalancer.elb.healthChecks = _.chain($scope.loadBalancer.elb.backendServices)
                  .map('healthCheck')
                  .uniq('name')
                  .value();
              }
            });
          }
          accountService.getAccountDetails(loadBalancer.accountId).then(function(accountDetails) {
            let resourceTypes;

            if ($scope.loadBalancer.loadBalancerType === 'INTERNAL') {
              resourceTypes = ['gce_forwarding_rule', 'gce_backend_service'];
            } else if ($scope.loadBalancer.loadBalancerType === 'NETWORK') {
              resourceTypes = ['gce_forwarding_rule', 'gce_target_pool', 'gce_health_check'];
            } else if ($scope.loadBalancer.loadBalancerType === 'SSL') {
              resourceTypes = ['gce_forwarding_rule', 'gce_backend_service'];
            } else {
              // $scope.loadBalancer.loadBalancerType === 'HTTP'
              resourceTypes = ['http_load_balancer', 'gce_target_http_proxy', 'gce_url_map', 'gce_backend_service'];
            }

            resourceTypes = _.join(resourceTypes, ' OR ');

            $scope.loadBalancer.logsLink =
              'https://console.developers.google.com/project/' + accountDetails.project + '/logs?advancedFilter=resource.type=(' + resourceTypes + ')%0A\"' + $scope.loadBalancer.name + '\"';
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

    function getBackendServices (loadBalancer) {
      var backendServices = [loadBalancer.defaultService];

      if (loadBalancer.hostRules.length) {
        backendServices = _.chain(loadBalancer.hostRules)
          .reduce((services, hostRule) => {
            services.push(hostRule.pathMatcher.defaultService);
            return services.concat(_.map(hostRule.pathMatcher.pathRules, 'backendService'));
          }, backendServices)
          .uniqBy('name')
          .value();
      }
      return backendServices;
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
      let wizard = loadBalancerTypeToWizardMap[$scope.loadBalancer.loadBalancerType];

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
      if (!($scope.loadBalancer.instances && $scope.loadBalancer.instances.length)) {
        $uibModal.open({
          controller: 'gceLoadBalancerDeleteModalCtrl as ctrl',
          templateUrl: require('./deleteModal/deleteModal.html'),
          resolve: {
            application: () => application,
            loadBalancer: () => $scope.loadBalancer,
          },
        });
      }
    };

    this.isElSeven = elSevenUtils.isElSeven;
  }
);
