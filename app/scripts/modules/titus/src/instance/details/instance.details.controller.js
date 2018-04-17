'use strict';

const angular = require('angular');
import { defaults, filter } from 'lodash';

import {
  ACCOUNT_SERVICE,
  CLOUD_PROVIDER_REGISTRY,
  CONFIRMATION_MODAL_SERVICE,
  INSTANCE_READ_SERVICE,
  INSTANCE_WRITE_SERVICE,
  RECENT_HISTORY_SERVICE,
  SETTINGS,
} from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.instance.detail.titus.controller', [
    require('@uirouter/angularjs').default,
    require('angular-ui-bootstrap'),
    ACCOUNT_SERVICE,
    INSTANCE_WRITE_SERVICE,
    INSTANCE_READ_SERVICE,
    CONFIRMATION_MODAL_SERVICE,
    RECENT_HISTORY_SERVICE,
    CLOUD_PROVIDER_REGISTRY,
    require('../../securityGroup/securityGroup.read.service').name,
  ])
  .controller('titusInstanceDetailsCtrl', function(
    $scope,
    $q,
    $state,
    $uibModal,
    accountService,
    instanceWriter,
    confirmationModalService,
    recentHistoryService,
    cloudProviderRegistry,
    instanceReader,
    instance,
    app,
    titusSecurityGroupReader,
  ) {
    // needed for standalone instances
    $scope.detailsTemplateUrl = cloudProviderRegistry.getValue('titus', 'instance.detailsTemplateUrl');

    $scope.state = {
      loading: true,
      standalone: app.isStandalone,
    };

    $scope.application = app;
    $scope.gateUrl = SETTINGS.gateUrl;

    function extractHealthMetrics(instance, latest) {
      // do not backfill on standalone instances
      if (app.isStandalone) {
        instance.health = latest.health;
      }

      instance.health = instance.health || [];
      var displayableMetrics = instance.health.filter(function(metric) {
        return metric.state !== 'Unknown';
      });

      // backfill details where applicable
      if (latest.health) {
        displayableMetrics.forEach(function(metric) {
          var detailsMatch = latest.health.filter(function(latestHealth) {
            return latestHealth.type === metric.type;
          });
          if (detailsMatch.length) {
            defaults(metric, detailsMatch[0]);
          }
        });
      }
      $scope.healthMetrics = displayableMetrics;
    }

    function retrieveInstance() {
      var extraData = {};
      var instanceSummary, loadBalancers, account, region, vpcId;
      app.serverGroups.data.some(function(serverGroup) {
        return serverGroup.instances.some(function(possibleInstance) {
          if (possibleInstance.id === instance.instanceId) {
            instanceSummary = possibleInstance;
            loadBalancers = serverGroup.loadBalancers;
            account = serverGroup.account;
            region = serverGroup.region;
            extraData.serverGroup = serverGroup.name;
            return true;
          }
        });
      });

      if (instanceSummary && account && region) {
        extraData.account = account;
        extraData.region = region;
        recentHistoryService.addExtraDataToLatest('instances', extraData);
        return instanceReader.getInstanceDetails(account, region, instance.instanceId).then(function(details) {
          $scope.state.loading = false;
          extractHealthMetrics(instanceSummary, details);
          $scope.instance = defaults(details, instanceSummary);
          $scope.instance.account = account;
          $scope.instance.region = region;
          $scope.instance.vpcId = vpcId;
          $scope.instance.loadBalancers = loadBalancers;
          $scope.baseIpAddress = $scope.instance.placement.containerIp || $scope.instance.placement.host;
          $scope.instance.externalIpAddress = $scope.instance.placement.host;
          if (details.securityGroups) {
            $scope.securityGroups = _.chain(details.securityGroups)
              .map(function(securityGroup) {
                return titusSecurityGroupReader.resolveIndexedSecurityGroup(
                  app['securityGroupsIndex'],
                  extraData,
                  securityGroup.groupId,
                );
              })
              .compact()
              .value();
          }
          getBastionAddressForAccount($scope.instance.account, $scope.instance.region);
        }, autoClose);
      }

      if (!instanceSummary) {
        $scope.instanceIdNotFound = instance.instanceId;
        $scope.state.loading = false;
      }
      return $q.when(null);
    }

    function autoClose() {
      if ($scope.$$destroyed) {
        return;
      }
      $state.params.allowModalToStayOpen = true;
      $state.go('^', null, { location: 'replace' });
    }

    this.canRegisterWithLoadBalancer = function() {
      return false;
    };

    this.canDeregisterFromLoadBalancer = function() {
      return false;
    };

    this.canRegisterWithDiscovery = function() {
      let healthMetrics = $scope.instance.health || [];
      var discoveryHealth = healthMetrics.filter(function(health) {
        return health.type === 'Discovery';
      });
      return discoveryHealth.length ? discoveryHealth[0].state === 'OutOfService' : false;
    };

    this.terminateInstance = function terminateInstance() {
      var instance = $scope.instance;
      instance.instanceId = instance.id;
      var taskMonitor = {
        application: app,
        title: 'Terminating ' + instance.instanceId,
        onTaskComplete: function() {
          if ($state.includes('**.instanceDetails', { id: instance.instanceId })) {
            $state.go('^');
          }
        },
      };

      var submitMethod = function() {
        let params = { cloudProvider: 'titus' };
        if (instance.serverGroup) {
          params.managedInstanceGroupName = instance.serverGroup;
        }
        return instanceWriter.terminateInstance(instance, app, params);
      };

      confirmationModalService.confirm({
        header: 'Really terminate ' + instance.id + '?',
        buttonText: 'Terminate ' + instance.id,
        account: instance.account,
        provider: 'titus',
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
      });
    };

    this.terminateInstanceAndShrinkServerGroup = function terminateInstanceAndShrinkServerGroup() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: app,
        title: 'Terminating ' + instance.instanceId + ' and shrinking server group',
        onTaskComplete: function() {
          if ($state.includes('**.instanceDetails', { instanceId: instance.instanceId })) {
            $state.go('^');
          }
        },
      };

      var submitMethod = function() {
        return instanceWriter.terminateInstancesAndShrinkServerGroups(
          [
            {
              cloudProvider: instance.cloudProvider,
              instanceIds: [instance.id],
              account: instance.account,
              region: instance.region,
              serverGroup: instance.serverGroup,
              instances: [instance],
            },
          ],
          app,
        );
      };

      confirmationModalService.confirm({
        header: 'Really terminate ' + instance.id + ' and shrink ' + instance.serverGroup + '?',
        buttonText: 'Terminate ' + instance.id + ' and shrink ' + instance.serverGroup,
        account: instance.account,
        provider: 'titus',
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
      });
    };

    this.registerInstanceWithLoadBalancer = function registerInstanceWithLoadBalancer() {
      // Do nothing
    };

    this.deregisterInstanceFromLoadBalancer = function deregisterInstanceFromLoadBalancer() {
      // Do nothing
    };

    this.enableInstanceInDiscovery = function enableInstanceInDiscovery() {
      var instance = $scope.instance;
      instance.instanceId = instance.id;

      var taskMonitor = {
        application: app,
        title: 'Enabling ' + instance.instanceId + ' in discovery',
      };

      var submitMethod = function() {
        return instanceWriter.enableInstanceInDiscovery(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really enable ' + instance.instanceId + ' in discovery?',
        buttonText: 'Enable ' + instance.instanceId,
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
      });
    };

    this.disableInstanceInDiscovery = function disableInstanceInDiscovery() {
      var instance = $scope.instance;
      instance.instanceId = instance.id;

      var taskMonitor = {
        application: app,
        title: 'Disabling ' + instance.instanceId + ' in discovery',
      };

      var submitMethod = function() {
        return instanceWriter.disableInstanceInDiscovery(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really disable ' + instance.instanceId + ' in discovery?',
        buttonText: 'Disable ' + instance.instanceId,
        provider: 'titus',
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
      });
    };

    this.hasHealthState = function hasHealthState(healthProviderType, state) {
      let healthMetrics = $scope.instance.health || [];
      return healthMetrics.some(function(health) {
        return health.type === healthProviderType && health.state === state;
      });
    };

    let getBastionAddressForAccount = (account, region) => {
      return accountService.getAccountDetails(account).then(details => {
        this.bastionHost = details.bastionHost || 'unknown';

        const discoveryHealth = $scope.instance.health.find(m => m.type === 'Discovery');

        if (discoveryHealth) {
          this.discoveryInfoLink = `http://discoveryreadonly.${$scope.instance.region}.dyn${
            details.environment
          }.netflix.net:7001/discovery/v2/apps/${discoveryHealth.application}/${$scope.instance.instanceId}`;
        }

        this.titusUiEndpoint = filter(details.regions, { name: region })[0].endpoint;
        $scope.sshLink = `ssh -t ${this.bastionHost} 'titus-ssh -region ${$scope.instance.region} -id ${
          $scope.instance.id
        }'`;
      });
    };

    this.hasPorts = () => {
      return Object.keys($scope.instance.resources.ports).length > 0;
    };

    let initialize = app.isStandalone ? retrieveInstance() : app.serverGroups.ready().then(retrieveInstance);

    initialize.then(() => {
      // Two things to look out for here:
      //  1. If the retrieveInstance call completes *after* the user has navigated away from the view, there
      //     is no point in subscribing to the refresh
      //  2. If this is a standalone instance, there is no application that will refresh
      if (!$scope.$$destroyed && !app.isStandalone) {
        app.serverGroups.onRefresh($scope, retrieveInstance);
      }
    });

    $scope.account = instance.account;
  });
