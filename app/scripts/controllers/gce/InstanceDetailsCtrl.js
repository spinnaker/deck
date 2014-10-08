'use strict';

require('../../app');
var angular = require('angular');

angular.module('deckApp.gce')
  .controller('gceInstanceDetailsCtrl', function ($scope, $state, notifications, instance, application, orcaService, confirmationModalService) {
    function extractHealthMetrics(instance) {
      if (!instance.health) {
        $scope.healthMetrics = [];
        return;
      }
      var displayableMetrics = instance.health.filter(
        function(metric) {
          return metric.type !== 'Amazon' || metric.state !== 'Unknown';
        });
      $scope.healthMetrics = displayableMetrics;
    }

    function extractInstance() {
      application.clusters.some(function (cluster) {
        return cluster.serverGroups.some(function (serverGroup) {
          return serverGroup.instances.some(function (possibleInstance) {
            if (possibleInstance.instanceId === instance.instanceId) {
              $scope.instance = possibleInstance;
              extractHealthMetrics(possibleInstance);
              return true;
            }
          });
        });
      });
      if (!$scope.instance) {
        notifications.create({
          message: 'Could not find instance "' + instance.instanceId,
          autoDismiss: true,
          hideTimestamp: true,
          strong: true
        });
        $state.go('^');
        instance.notFound = true;
        instance.healthStatus = 'Unhealthy';
        $scope.instance = instance;
      }
    }

    this.terminateInstance = function terminateInstance() {
      var instance = $scope.instance;
      confirmationModalService.confirm({
        header: 'Really terminate ' + instance.instanceId + '?',
        buttonText: 'Terminate ' + instance.instanceId,
        destructive: true,
        account: instance.account
      }).then(function () {
        orcaService.terminateInstance(instance, $scope.application.name)
          .then(function (task) {
            console.warn('task id: ', task.id);
          });
      });
    };

    extractInstance();

    application.registerAutoRefreshHandler(extractInstance, $scope);

    $scope.account = instance.account;

  }
);
