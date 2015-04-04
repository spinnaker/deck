'use strict';


angular.module('deckApp.instance.detail.gce.controller', [
  'ui.router',
  'deckApp.notifications.service',
  'deckApp.instance.write.service',
  'deckApp.instance.read.service',
  'deckApp.confirmationModal.service'
])
  .controller('gceInstanceDetailsCtrl', function ($scope, $state, notificationsService,
                                               instanceWriter, confirmationModalService,
                                               instanceReader,instance, application) {

    // needed for standalone instances
    $scope.provider = 'gce';

    $scope.state = {
      loading: true,
      standalone: application.isStandalone,
    };

    function extractHealthMetrics(instance, latest) {
      // do not backfill on standalone instances
      if (application.isStandalone) {
        instance.health = latest.health;
      }

      instance.health = instance.health || [];
      var displayableMetrics = instance.health.filter(
        function(metric) {
          return metric.type !== 'GCE' || metric.state !== 'Unknown';
        });
      $scope.healthMetrics = displayableMetrics;
    }

    function retrieveInstance() {
      var instanceSummary, loadBalancers, account, region, vpcId;
      if (!application.clusters) {
        // standalone instance
        instanceSummary = {};
        loadBalancers = [];
        account = instance.account;
        region = instance.region;
      } else {
        application.clusters.some(function (cluster) {
          return cluster.serverGroups.some(function (serverGroup) {
            return serverGroup.instances.some(function (possibleInstance) {
              if (possibleInstance.id === instance.instanceId) {
                instanceSummary = possibleInstance;
                loadBalancers = serverGroup.loadBalancers;
                account = serverGroup.account;
                region = serverGroup.region;
                vpcId = serverGroup.vpcId;
                return true;
              }
            });
          });
        });
      }

      if (instanceSummary && account && region) {
        instanceReader.getInstanceDetails(account, region, instance.instanceId).then(function(details) {
          details = details.plain();
          $scope.state.loading = false;
          extractHealthMetrics(instanceSummary, details);
          $scope.instance = _.defaults(details, instanceSummary);
          $scope.instance.account = account;
          $scope.instance.region = region;
          $scope.instance.vpcId = vpcId;
          $scope.instance.loadBalancers = loadBalancers;
          $scope.baseIpAddress = details.publicDnsName || details.privateIpAddress;

          $scope.instance.internalDnsName = $scope.instance.instanceId;
          $scope.instance.internalIpAddress = $scope.instance.networkInterfaces[0].networkIP;
          $scope.instance.externalIpAddress = $scope.instance.networkInterfaces[0].accessConfigs[0].natIP;

          $scope.instance.sshLink =
            $scope.instance.selfLink.replace('www.googleapis.com/compute/v1', 'cloudssh.developers.google.com') + '?authuser=0&hl=en_US';
        },
        function() {
          // When an instance is first starting up, we may not have the details cached in oort yet, but we still
          // want to let the user see what details we have
          $scope.state.loading = false;
        });
      }

      if (!instanceSummary) {
        notificationsService.create({
          message: 'Could not find instance "' + instance.instanceId,
          autoDismiss: true,
          hideTimestamp: true,
          strong: true
        });
        $state.go('^');
      }
    }

    this.canRegisterWithLoadBalancer = function() {
      var instance = $scope.instance;
      if (!instance.loadBalancers || !instance.loadBalancers.length) {
        return false;
      }
      var outOfService = instance.health.some(function(health) {
        return health.type === 'LoadBalancer' && health.state === 'OutOfService';
      });
      var hasLoadBalancerHealth = instance.health.some(function(health) {
        return health.type === 'LoadBalancer';
      });
      return outOfService || !hasLoadBalancerHealth;
    };

    this.canRegisterWithDiscovery = function() {
      var instance = $scope.instance;
      var discoveryHealth = instance.health.filter(function(health) {
        return health.type === 'Discovery';
      });
      return discoveryHealth.length ? discoveryHealth[0].state === 'OutOfService' : false;
    };

    this.terminateInstance = function terminateInstance() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: application,
        title: 'Terminating ' + instance.instanceId,
        forceRefreshMessage: 'Refreshing application...',
        forceRefreshEnabled: true,
        onApplicationRefresh: function() {
          if ($state.includes('**.instanceDetails', {instanceId: instance.instanceId})) {
            $state.go('^');
          }
        }
      };

      var submitMethod = function () {
        return instanceWriter.terminateInstance(instance, application);
      };

      confirmationModalService.confirm({
        header: 'Really terminate ' + instance.instanceId + '?',
        buttonText: 'Terminate ' + instance.instanceId,
        destructive: true,
        account: instance.account,
        provider: 'gce',
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.rebootInstance = function rebootInstance() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: application,
        title: 'Rebooting ' + instance.instanceId
      };

      var submitMethod = function () {
        return instanceWriter.rebootInstance(instance, application);
      };

      confirmationModalService.confirm({
        header: 'Really reboot ' + instance.instanceId + '?',
        buttonText: 'Reboot ' + instance.instanceId,
        destructive: true,
        account: instance.account,
        provider: 'gce',
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.registerInstanceWithLoadBalancer = function registerInstanceWithLoadBalancer() {
      var instance = $scope.instance;
      var loadBalancerNames = _.pluck(instance.loadBalancers, 'name').join(' and ');

      var taskMonitor = {
        application: application,
        title: 'Registering ' + instance.instanceId + ' with ' + loadBalancerNames
      };

      var submitMethod = function () {
        return instanceWriter.registerInstanceWithLoadBalancer(instance, application);
      };

      confirmationModalService.confirm({
        header: 'Really register ' + instance.instanceId + ' with ' + loadBalancerNames + '?',
        buttonText: 'Register ' + instance.instanceId,
        destructive: false,
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.deregisterInstanceFromLoadBalancer = function deregisterInstanceFromLoadBalancer() {
      var instance = $scope.instance;
      var loadBalancerNames = _.pluck(instance.loadBalancers, 'name').join(' and ');

      var taskMonitor = {
        application: application,
        title: 'Deregistering ' + instance.instanceId + ' from ' + loadBalancerNames
      };

      var submitMethod = function () {
        return instanceWriter.deregisterInstanceFromLoadBalancer(instance, application);
      };

      confirmationModalService.confirm({
        header: 'Really deregister ' + instance.instanceId + ' from ' + loadBalancerNames + '?',
        buttonText: 'Deregister ' + instance.instanceId,
        destructive: true,
        provider: 'gce',
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.enableInstanceInDiscovery = function enableInstanceInDiscovery() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: application,
        title: 'Enabling ' + instance.instanceId + ' in discovery'
      };

      var submitMethod = function () {
        return instanceWriter.enableInstanceInDiscovery(instance, application);
      };

      confirmationModalService.confirm({
        header: 'Really enable ' + instance.instanceId + ' in discovery?',
        buttonText: 'Enable ' + instance.instanceId,
        destructive: false,
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.disableInstanceInDiscovery = function disableInstanceInDiscovery() {
      var instance = $scope.instance;

      var taskMonitor = {
        application: application,
        title: 'Disabling ' + instance.instanceId + ' in discovery'
      };

      var submitMethod = function () {
        return instanceWriter.disableInstanceInDiscovery(instance, application);
      };

      confirmationModalService.confirm({
        header: 'Really disable ' + instance.instanceId + ' in discovery?',
        buttonText: 'Disable ' + instance.instanceId,
        destructive: true,
        provider: 'gce',
        account: instance.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    this.hasHealthState = function hasHealthState(healthProviderType, state) {
      var instance = $scope.instance;
      return (instance.health.some(function (health) {
        return health.type === healthProviderType && health.state === state;
      })
      );
    };

    retrieveInstance();

    application.registerAutoRefreshHandler(retrieveInstance, $scope);

    $scope.account = instance.account;

  }
);
