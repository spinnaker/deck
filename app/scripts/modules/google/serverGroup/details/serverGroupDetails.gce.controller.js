'use strict';
/* jshint camelcase:false */

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.details.gce.controller', [
  require('angular-ui-router'),
  require('../configure/ServerGroupCommandBuilder.js'),
  require('../../../serverGroups/serverGroup.read.service.js'),
  require('../../../confirmationModal/confirmationModal.service.js'),
  require('../../../serverGroups/serverGroup.write.service.js'),
  require('../../../serverGroups/configure/common/runningExecutions.service.js'),
  require('utils:lodash'),
  require('../../../insight/insightFilterState.model.js'),
])
  .controller('gceServerGroupDetailsCtrl', function ($scope, $state, $templateCache, $compile, app, serverGroup, InsightFilterStateModel,
                                                     gceServerGroupCommandBuilder, serverGroupReader, $modal, confirmationModalService, _, serverGroupWriter,
                                                     executionFilterService) {

    let application = app;

    $scope.state = {
      loading: true
    };

    $scope.InsightFilterStateModel = InsightFilterStateModel;

    function extractServerGroupSummary() {
      var summary = _.find(application.serverGroups, function (toCheck) {
        return toCheck.name === serverGroup.name && toCheck.account === serverGroup.accountId && toCheck.region === serverGroup.region;
      });
      if (!summary) {
        application.loadBalancers.some(function (loadBalancer) {
          if (loadBalancer.account === serverGroup.accountId && loadBalancer.region === serverGroup.region) {
            return loadBalancer.serverGroups.some(function (possibleServerGroup) {
              if (possibleServerGroup.name === serverGroup.name) {
                summary = possibleServerGroup;
                return true;
              }
            });
          }
        });
      }
      return summary;
    }

    function retrieveServerGroup() {
      var summary = extractServerGroupSummary();
      serverGroupReader.getServerGroup(application.name, serverGroup.accountId, serverGroup.region, serverGroup.name).then(function(details) {
        cancelLoader();

        var restangularlessDetails = details.plain();
        angular.extend(restangularlessDetails, summary);

        $scope.serverGroup = restangularlessDetails;
        $scope.runningExecutions = function() {
          return executionFilterService.filterRunningExecutions($scope.serverGroup.executions);
        };

        if (!_.isEmpty($scope.serverGroup)) {
          if (details.launchConfig && details.launchConfig.securityGroups) {
            $scope.securityGroups = _(details.launchConfig.securityGroups).map(function(id) {
              return _.find(application.securityGroups, { 'accountName': serverGroup.accountId, 'region': serverGroup.region, 'id': id }) ||
                _.find(application.securityGroups, { 'accountName': serverGroup.accountId, 'region': serverGroup.region, 'name': id });
            }).compact().value();
          }

          var pathSegments = $scope.serverGroup.launchConfig.instanceTemplate.selfLink.split('/');
          var projectId = pathSegments[pathSegments.indexOf('projects') + 1];
          $scope.serverGroup.logsLink =
            'https://console.developers.google.com/project/' + projectId + '/logs?service=compute.googleapis.com&minLogLevel=0&filters=text:' + $scope.serverGroup.name;
        } else {
          $state.go('^');
        }
      });
    }

    function cancelLoader() {
      $scope.state.loading = false;
    }

    retrieveServerGroup();

    application.registerAutoRefreshHandler(retrieveServerGroup, $scope);

    this.destroyServerGroup = function destroyServerGroup() {
      var serverGroup = $scope.serverGroup;

      var taskMonitor = {
        application: application,
        title: 'Destroying ' + serverGroup.name,
        forceRefreshMessage: 'Refreshing application...',
        forceRefreshEnabled: true,
        katoPhaseToMonitor: 'DESTROY_ASG'
      };

      var submitMethod = function () {
        return serverGroupWriter.destroyServerGroup(serverGroup, application);
      };

      var stateParams = {
        name: serverGroup.name,
        accountId: serverGroup.account,
        region: serverGroup.region
      };

      confirmationModalService.confirm({
        header: 'Really destroy ' + serverGroup.name + '?',
        buttonText: 'Destroy ' + serverGroup.name,
        destructive: true,
        provider: 'gce',
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
        body: this.getBodyTemplate(serverGroup, application),
        onTaskComplete: function() {
          if ($state.includes('**.serverGroup', stateParams)) {
            $state.go('^');
          }
        },
        onApplicationRefresh: function() {
          if ($state.includes('**.serverGroup', stateParams)) {
            $state.go('^');
          }
        }
      });
    };

    this.getBodyTemplate = function(serverGroup, application) {
      if(this.isLastServerGroupInRegion(serverGroup, application)){
        var template = $templateCache.get(require('../../../serverGroups/details/deleteLastServerGroupWarning.html'));
        $scope.deletingServerGroup = serverGroup;
        return $compile(template)($scope);
      }
    };

    this.isLastServerGroupInRegion = function (serverGroup, application ) {
      try {
        var cluster = _.find(application.clusters, {name: serverGroup.cluster, account:serverGroup.account});
        return _.filter(cluster.serverGroups, {region: serverGroup.region}).length === 1;
      } catch (error) {
        return false;
      }
    };

    this.disableServerGroup = function disableServerGroup() {
      var serverGroup = $scope.serverGroup;

      var taskMonitor = {
        application: application,
        title: 'Disabling ' + serverGroup.name
      };

      var submitMethod = function () {
        return serverGroupWriter.disableServerGroup(serverGroup, application);
      };

      confirmationModalService.confirm({
        header: 'Really disable ' + serverGroup.name + '?',
        buttonText: 'Disable ' + serverGroup.name,
        destructive: true,
        provider: 'gce',
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });

    };

    this.enableServerGroup = function enableServerGroup() {
      var serverGroup = $scope.serverGroup;

      var taskMonitor = {
        application: application,
        title: 'Enabling ' + serverGroup.name,
        forceRefreshMessage: 'Refreshing application...',
      };

      var submitMethod = function () {
        return serverGroupWriter.enableServerGroup(serverGroup, application);
      };

      confirmationModalService.confirm({
        header: 'Really enable ' + serverGroup.name + '?',
        buttonText: 'Enable ' + serverGroup.name,
        destructive: false,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });

    };

    this.resizeServerGroup = function resizeServerGroup() {
      $modal.open({
        templateUrl: require('../../../serverGroups/details/resizeServerGroup.html'),
        controller: 'ResizeServerGroupCtrl as ctrl',
        resolve: {
          serverGroup: function() { return $scope.serverGroup; },
          application: function() { return application; }
        }
      });
    };

    this.cloneServerGroup = function cloneServerGroup(serverGroup) {
      $modal.open({
        templateUrl: require('../configure/wizard/serverGroupWizard.html'),
        controller: 'gceCloneServerGroupCtrl as ctrl',
        resolve: {
          title: function() { return 'Clone ' + serverGroup.name; },
          application: function() { return application; },
          serverGroup: function() { return serverGroup; },
          serverGroupCommand: function() { return gceServerGroupCommandBuilder.buildServerGroupCommandFromExisting(application, serverGroup); },
        }
      });
    };

    this.showUserData = function showScalingActivities() {
      $scope.userData = window.atob($scope.serverGroup.launchConfig.userData);
      $modal.open({
        templateUrl: require('../../../serverGroups/details/userData.html'),
        controller: 'CloseableModalCtrl',
        scope: $scope
      });
    };

    this.buildJenkinsLink = function() {
      if ($scope.serverGroup && $scope.serverGroup.buildInfo && $scope.serverGroup.buildInfo.jenkins) {
        var jenkins = $scope.serverGroup.buildInfo.jenkins;
        return jenkins.host + 'job/' + jenkins.name + '/' + jenkins.number;
      }
      return null;
    };

    this.truncateCommitHash = function() {
      if ($scope.serverGroup && $scope.serverGroup.buildInfo && $scope.serverGroup.buildInfo.commit) {
        return $scope.serverGroup.buildInfo.commit.substring(0, 8);
      }
      return null;
    };

    this.getNetwork = function() {
      if ($scope.serverGroup && $scope.serverGroup.launchConfig.instanceTemplate.properties) {
        var networkInterfaces = $scope.serverGroup.launchConfig.instanceTemplate.properties.networkInterfaces;

        if (networkInterfaces.length === 1) {
          var networkUrl = networkInterfaces[0].network;

          return _.last(networkUrl.split('/'));
        }
      }
      return null;
    };
  }
).name;
