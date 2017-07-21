'use strict';

const angular = require('angular');
import _ from 'lodash';

import {
  CLOUD_PROVIDER_REGISTRY,
  CONFIRMATION_MODAL_SERVICE,
  INSTANCE_READ_SERVICE,
  RECENT_HISTORY_SERVICE,
  SETTINGS
} from '@spinnaker/core';

import { AMAZON_INSTANCE_WRITE_SERVICE } from 'amazon/instance/amazon.instance.write.service';

module.exports = angular.module('spinnaker.amazon.instance.details.controller', [
  require('@uirouter/angularjs').default,
  require('angular-ui-bootstrap'),
  AMAZON_INSTANCE_WRITE_SERVICE,
  INSTANCE_READ_SERVICE,
  require('../../vpc/vpcTag.directive.js'),
  CONFIRMATION_MODAL_SERVICE,
  RECENT_HISTORY_SERVICE,
  CLOUD_PROVIDER_REGISTRY,
])
  .controller('awsInstanceDetailsCtrl', function ($scope, $state, $uibModal,
                                                  amazonInstanceWriter, confirmationModalService, recentHistoryService,
                                                  cloudProviderRegistry, instanceReader, instance, app, $q, overrides) {
    // needed for standalone instances
    $scope.detailsTemplateUrl = cloudProviderRegistry.getValue('aws', 'instance.detailsTemplateUrl');

    $scope.state = {
      loading: true,
      standalone: app.isStandalone,
      instancePort: _.get(app, 'attributes.instancePort') || SETTINGS.defaultInstancePort || 80,
    };

    $scope.application = app;

    function extractHealthMetrics(instance, latest) {
      // do not backfill on standalone instances
      if (app.isStandalone) {
        instance.health = latest.health;
      }

      instance.health = instance.health || [];
      var displayableMetrics = instance.health.filter(
        function(metric) {
          return metric.type !== 'Amazon' || metric.state !== 'Unknown';
        }
      );
      // backfill details where applicable
      if (latest.health) {
        displayableMetrics.forEach(function (metric) {
          var detailsMatch = latest.health.filter(function (latestHealth) {
            return latestHealth.type === metric.type;
          });
          if (detailsMatch.length) {
            _.defaults(metric, detailsMatch[0]);
          }
        });
      }
      $scope.healthMetrics = displayableMetrics;
    }

    function retrieveInstance() {
      var extraData = {};
      var instanceSummary, loadBalancers, targetGroups, account, region, vpcId;
      if (!app.serverGroups) {
        // standalone instance
        instanceSummary = {};
        loadBalancers = [];
        targetGroups = [];
        account = instance.account;
        region = instance.region;
      } else {
        app.serverGroups.data.some(function (serverGroup) {
          return serverGroup.instances.some(function (possibleInstance) {
            if (possibleInstance.id === instance.instanceId) {
              instanceSummary = possibleInstance;
              loadBalancers = serverGroup.loadBalancers;
              targetGroups = serverGroup.targetGroups;
              account = serverGroup.account;
              region = serverGroup.region;
              vpcId = serverGroup.vpcId;
              extraData.serverGroup = serverGroup.name;
              extraData.vpcId = serverGroup.vpcId;
              return true;
            }
          });
        });
        if (!instanceSummary) {
          // perhaps it is in a server group that is part of another app
          app.loadBalancers.data.some(function (loadBalancer) {
            return loadBalancer.instances.some(function (possibleInstance) {
              if (possibleInstance.id === instance.instanceId) {
                instanceSummary = possibleInstance;
                loadBalancers = [loadBalancer.name];
                account = loadBalancer.account;
                region = loadBalancer.region;
                vpcId = loadBalancer.vpcId;
                return true;
              }
            }) ||
            loadBalancer.targetGroups.some(function (targetGroup) {
              return targetGroup.instances.some(function (possibleInstance) {
                if (possibleInstance.id === instance.instanceId) {
                  instanceSummary = possibleInstance;
                  targetGroups = [targetGroup.name];
                  account = loadBalancer.account;
                  region = loadBalancer.region;
                  vpcId = loadBalancer.vpcId;
                  return true;
                }
              });
            });
          });
          if (!instanceSummary) {
            // perhaps it is in a disabled server group via a load balancer
            app.loadBalancers.data.some(function(loadBalancer) {
              return loadBalancer.serverGroups.some(function(serverGroup) {
                if (!serverGroup.isDisabled) {
                  return false;
                }
                return serverGroup.instances.some(function(possibleInstance) {
                  if (possibleInstance.id === instance.instanceId) {
                    instanceSummary = possibleInstance;
                    loadBalancers = [loadBalancer.name];
                    account = loadBalancer.account;
                    region = loadBalancer.region;
                    vpcId = loadBalancer.vpcId;
                    return true;
                  }
                });
              }) ||
              loadBalancer.targetGroups.some(function(targetGroup) {
                targetGroup.serverGroups.some(function(serverGroup) {
                  if (!serverGroup.isDisabled) {
                    return false;
                  }
                  return serverGroup.instances.some(function(possibleInstance) {
                    if (possibleInstance.id === instance.instanceId) {
                      instanceSummary = possibleInstance;
                      loadBalancers = [loadBalancer.name];
                      account = loadBalancer.account;
                      region = loadBalancer.region;
                      vpcId = loadBalancer.vpcId;
                      return true;
                    }
                  });
                });
              });
            });
          }
        }
      }

      if (instanceSummary && account && region) {
        extraData.account = account;
        extraData.region = region;
        recentHistoryService.addExtraDataToLatest('instances', extraData);
        return instanceReader.getInstanceDetails(account, region, instance.instanceId).then(
          (details) => {
            if ($scope.$$destroyed) {
              return;
            }
            $scope.state.loading = false;
            extractHealthMetrics(instanceSummary, details);
            $scope.instance = _.defaults(details, instanceSummary);
            $scope.instance.account = account;
            $scope.instance.region = region;
            $scope.instance.vpcId = vpcId;
            $scope.instance.loadBalancers = loadBalancers;
            $scope.instance.targetGroups = targetGroups;
            if($scope.instance.networkInterfaces) {
              var permanentNetworkInterfaces = $scope.instance.networkInterfaces.filter(f => f.attachment.deleteOnTermination === false);
              if (permanentNetworkInterfaces.length) {
                $scope.instance.permanentIps = permanentNetworkInterfaces.map(f => f.privateIpAddress);
              }
            }
            $scope.baseIpAddress = details.publicDnsName || details.privateIpAddress;
            if (overrides.instanceDetailsLoaded) {
              overrides.instanceDetailsLoaded();
            }
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
      if (app.isStandalone) {
        $scope.state.loading = false;
        $scope.instanceIdNotFound = instance.instanceId;
        $scope.state.notFoundStandalone = true;
        recentHistoryService.removeLastItem('instances');
      } else {
        $state.params.allowModalToStayOpen = true;
        $state.go('^', null, {location: 'replace'});
      }
    }

    this.canDeregisterFromLoadBalancer = function() {
      let healthMetrics = $scope.instance.health || [];
      return healthMetrics.some(function(health) {
        return health.type === 'LoadBalancer';
      });
    };

    this.canRegisterWithLoadBalancer = function() {
      var instance = $scope.instance,
          healthMetrics = instance.health || [];
      if (!instance.loadBalancers || !instance.loadBalancers.length) {
        return false;
      }
      var outOfService = healthMetrics.some(function(health) {
        return health.type === 'LoadBalancer' && health.state === 'OutOfService';
      });
      var hasLoadBalancerHealth = healthMetrics.some(function(health) {
        return health.type === 'LoadBalancer';
      });
      return outOfService || !hasLoadBalancerHealth;
    };

    this.canDeregisterFromTargetGroup = function() {
      let healthMetrics = $scope.instance.health || [];
      return healthMetrics.some(function(health) {
        return health.type === 'TargetGroup' && health.state !== 'OutOfService';
      });
    };

    this.canRegisterWithTargetGroup = function() {
      var instance = $scope.instance,
          healthMetrics = instance.health || [];
      if (!instance.targetGroups || !instance.targetGroups.length) {
        return false;
      }
      var outOfService = healthMetrics.some(function(health) {
        return health.type === 'TargetGroup' && health.state === 'OutOfService';
      });
      var hasTargetGroupHealth = healthMetrics.some(function(health) {
        return health.type === 'TargetGroup';
      });
      return outOfService || !hasTargetGroupHealth;
    };

    this.canRegisterWithDiscovery = function() {
      var instance = $scope.instance;
      let healthMetrics = instance.health || [];
      var discoveryHealth = healthMetrics.filter(function(health) {
        return health.type === 'Discovery';
      });
      return discoveryHealth.length ? discoveryHealth[0].state === 'OutOfService' : false;
    };

    this.terminateInstance = function terminateInstance() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: app,
        title: 'Terminating ' + instance.instanceId,
        onTaskComplete: function() {
          if ($state.includes('**.instanceDetails', {instanceId: instance.instanceId})) {
            $state.go('^');
          }
        }
      };

      var submitMethod = function () {
        return amazonInstanceWriter.terminateInstance(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really terminate ' + instance.instanceId + '?',
        buttonText: 'Terminate ' + instance.instanceId,
        account: instance.account,
        provider: 'aws',
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.terminateInstanceAndShrinkServerGroup = function terminateInstanceAndShrinkServerGroup() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: app,
        title: 'Terminating ' + instance.instanceId + ' and shrinking server group',
        onTaskComplete: function() {
          if ($state.includes('**.instanceDetails', {instanceId: instance.instanceId})) {
            $state.go('^');
          }
        }
      };

      var submitMethod = function () {
        return amazonInstanceWriter.terminateInstanceAndShrinkServerGroup(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really terminate ' + instance.instanceId + ' and shrink ' + instance.serverGroup + '?',
        buttonText: 'Terminate ' + instance.instanceId + ' and shrink ' + instance.serverGroup,
        account: instance.account,
        provider: 'aws',
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.rebootInstance = function rebootInstance() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: app,
        title: 'Rebooting ' + instance.instanceId
      };

      var submitMethod = (params = {}) => {
        if (app.attributes && app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
          params.interestingHealthProviderNames = ['Amazon'];
        }

        return amazonInstanceWriter.rebootInstance(instance, app, params);
      };

      confirmationModalService.confirm({
        header: 'Really reboot ' + instance.instanceId + '?',
        buttonText: 'Reboot ' + instance.instanceId,
        account: instance.account,
        provider: 'aws',
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.registerInstanceWithLoadBalancer = function registerInstanceWithLoadBalancer() {
      var instance = $scope.instance;
      var loadBalancerNames = instance.loadBalancers.join(' and ');

      var taskMonitor = {
        application: app,
        title: 'Registering ' + instance.instanceId + ' with ' + loadBalancerNames
      };

      var submitMethod = function () {
        return amazonInstanceWriter.registerInstanceWithLoadBalancer(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really register ' + instance.instanceId + ' with ' + loadBalancerNames + '?',
        buttonText: 'Register ' + instance.instanceId,
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.deregisterInstanceFromLoadBalancer = function deregisterInstanceFromLoadBalancer() {
      var instance = $scope.instance;
      var loadBalancerNames = instance.loadBalancers.join(' and ');

      var taskMonitor = {
        application: app,
        title: 'Deregistering ' + instance.instanceId + ' from ' + loadBalancerNames
      };

      var submitMethod = function () {
        return amazonInstanceWriter.deregisterInstanceFromLoadBalancer(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really deregister ' + instance.instanceId + ' from ' + loadBalancerNames + '?',
        buttonText: 'Deregister ' + instance.instanceId,
        provider: 'aws',
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.registerInstanceWithTargetGroup = function registerInstanceWithTargetGroup() {
      var instance = $scope.instance;
      var targetGroupNames = instance.targetGroups.join(' and ');

      var taskMonitor = {
        application: app,
        title: 'Registering ' + instance.instanceId + ' with ' + targetGroupNames
      };

      var submitMethod = function () {
        return amazonInstanceWriter.registerInstanceWithTargetGroup(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really register ' + instance.instanceId + ' with ' + targetGroupNames + '?',
        buttonText: 'Register ' + instance.instanceId,
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.deregisterInstanceFromTargetGroup = function deregisterInstanceFromTargetGroup() {
      var instance = $scope.instance;
      var targetGroupNames = instance.targetGroups.join(' and ');

      var taskMonitor = {
        application: app,
        title: 'Deregistering ' + instance.instanceId + ' from ' + targetGroupNames
      };

      var submitMethod = function () {
        return amazonInstanceWriter.deregisterInstanceFromTargetGroup(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really deregister ' + instance.instanceId + ' from ' + targetGroupNames + '?',
        buttonText: 'Deregister ' + instance.instanceId,
        provider: 'aws',
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.enableInstanceInDiscovery = function enableInstanceInDiscovery() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: app,
        title: 'Enabling ' + instance.instanceId + ' in discovery'
      };

      var submitMethod = function () {
        return amazonInstanceWriter.enableInstanceInDiscovery(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really enable ' + instance.instanceId + ' in discovery?',
        buttonText: 'Enable ' + instance.instanceId,
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.disableInstanceInDiscovery = function disableInstanceInDiscovery() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: app,
        title: 'Disabling ' + instance.instanceId + ' in discovery'
      };

      var submitMethod = function () {
        return amazonInstanceWriter.disableInstanceInDiscovery(instance, app);
      };

      confirmationModalService.confirm({
        header: 'Really disable ' + instance.instanceId + ' in discovery?',
        buttonText: 'Disable ' + instance.instanceId,
        provider: 'aws',
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.hasHealthState = function hasHealthState(healthProviderType, state) {
      var instance = $scope.instance,
          healthMetrics = instance.health || [];
      return (healthMetrics.some(function (health) {
        return health.type === healthProviderType && health.state === state;
      })
      );
    };

    let initialize = app.isStandalone ?
      retrieveInstance() :
      $q.all([app.serverGroups.ready(), app.loadBalancers.ready()]).then(retrieveInstance);

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
  }
);
