'use strict';

const angular = require('angular');

import { V2_MODAL_WIZARD_SERVICE } from '@spinnaker/core';

module.exports = angular.module('spinnaker.serverGroup.configure.cf.cloneServerGroup', [
  require('@uirouter/angularjs').default,
  V2_MODAL_WIZARD_SERVICE,
])
  .controller('cfCloneServerGroupCtrl', function($scope, $uibModalInstance, $q, $state,
                                                 serverGroupWriter, v2modalWizardService, taskMonitorBuilder,
                                                 cfServerGroupConfigurationService,
                                                 serverGroupCommand, application, title) {
    $scope.pages = {
      templateSelection: require('./templateSelection.html'),
      basicSettings: require('./basicSettings.html'),
      loadBalancers: require('./loadBalancers.html'),
      services: require('./services.html'),
      envs: require('./envs.html'),
      artifact: require('./artifactSettings.html'),
      advanced: require('./advanced.html')
    };

    $scope.title = title;

    $scope.applicationName = application.name;
    $scope.application = application;

    $scope.command = serverGroupCommand;

    $scope.state = {
      loaded: false,
      requiresTemplateSelection: !!serverGroupCommand.viewState.requiresTemplateSelection,
    };

    function onApplicationRefresh() {
      // If the user has already closed the modal, do not navigate to the new details view
      if ($scope.$$destroyed) {
        return;
      }
      let cloneStage = $scope.taskMonitor.task.execution.stages.find((stage) => stage.type === 'cloneServerGroup');
      if (cloneStage && cloneStage.context['deploy.server.groups']) {
        let newServerGroupName = cloneStage.context['deploy.server.groups'][$scope.command.region];
        if (newServerGroupName) {
          var newStateParams = {
            serverGroup: newServerGroupName,
            accountId: $scope.command.credentials,
            region: $scope.command.region,
            provider: 'cf',
          };
          var transitionTo = '^.^.^.clusters.serverGroup';
          if ($state.includes('**.clusters.serverGroup')) {  // clone via details, all view
            transitionTo = '^.serverGroup';
          }
          if ($state.includes('**.clusters.cluster.serverGroup')) { // clone or create with details open
            transitionTo = '^.^.serverGroup';
          }
          if ($state.includes('**.clusters')) { // create new, no details open
            transitionTo = '.serverGroup';
          }
          $state.go(transitionTo, newStateParams);
        }
      }
    }

    function onTaskComplete() {
      application.serverGroups.refresh();
      application.serverGroups.onNextRefresh($scope, onApplicationRefresh);
    }

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: 'Creating your server group',
      modalInstance: $uibModalInstance,
      onTaskComplete: onTaskComplete,
    });

    function configureCommand() {
      cfServerGroupConfigurationService.configureCommand(serverGroupCommand).then(function () {
        $scope.state.loaded = true;
        initializeWizardState();
        initializeSelectOptions();
        initializeWatches();
      });
    }

    function initializeWizardState() {
      var mode = serverGroupCommand.viewState.mode;
      if (mode === 'clone' || mode === 'editPipeline') {
        if ($scope.command.image || $scope.command.viewState.disableImageSelection) {
          v2modalWizardService.markComplete('location');
        }
      }
    }

    function initializeWatches() {
      $scope.$watch('command.credentials', createResultProcessor($scope.command.credentialsChanged));
      $scope.$watch('command.region', createResultProcessor($scope.command.regionChanged));
      $scope.$watch('command.network', createResultProcessor($scope.command.networkChanged));
    }

    function initializeSelectOptions() {
      processCommandUpdateResult($scope.command.credentialsChanged());
      processCommandUpdateResult($scope.command.regionChanged());
      processCommandUpdateResult($scope.command.networkChanged());
    }

    function createResultProcessor(method) {
      return function() {
        processCommandUpdateResult(method());
      };
    }

    function processCommandUpdateResult() {
    }

    this.isValid = function () {
      return $scope.command &&
        ($scope.command.credentials !== null) && ($scope.command.instanceType !== null) &&
        ($scope.command.region !== null) &&
        ($scope.command.capacity.desired !== null) &&
        v2modalWizardService.isComplete();
    };

    this.showSubmitButton = function () {
      return v2modalWizardService.allPagesVisited();
    };

    this.clone = function () {
      $scope.command.targetSize = $scope.command.capacity.desired; // TODO(GLT): Unify on this or capacity

      // Convert list of single entry maps into a single, comprehensive map.
      let envs = {};
      _.forEach($scope.command.envs, function(env) {
        envs[env.key] = env.value;
      });
      $scope.command.envs = envs;

      // We want min/max set to the same value as desired.
      $scope.command.capacity.min = $scope.command.capacity.desired;
      $scope.command.capacity.max = $scope.command.capacity.desired;

      if ($scope.command.viewState.mode === 'editPipeline' || $scope.command.viewState.mode === 'createPipeline') {
        return $uibModalInstance.close($scope.command);
      }
      $scope.taskMonitor.submit(
        function() {
          return serverGroupWriter.cloneServerGroup(angular.copy($scope.command), application);
        }
      );
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };

    if (!$scope.state.requiresTemplateSelection) {
      configureCommand();
    } else {
      $scope.state.loaded = true;
    }

    this.templateSelected = () => {
      $scope.state.requiresTemplateSelection = false;
      configureCommand();
    };
  });
