'use strict';

const angular = require('angular');
import { FirewallLabels, ModalWizard, TaskMonitor } from '@spinnaker/core';

import { TITUS_SECURITY_GROUP_PICKER } from '../../../securityGroup/securityGroupPicker.component';
import { TITUS_LOAD_BALANCER_SELECTOR } from '../../../loadBalancers/loadBalancerSelector.component';

module.exports = angular
  .module('spinnaker.serverGroup.configure.titus.cloneServerGroup', [
    require('@uirouter/angularjs').default,
    TITUS_SECURITY_GROUP_PICKER,
    TITUS_LOAD_BALANCER_SELECTOR,
  ])
  .controller('titusCloneServerGroupCtrl', function(
    $scope,
    $uibModalInstance,
    $q,
    $state,
    serverGroupWriter,
    titusServerGroupConfigurationService,
    serverGroupCommand,
    application,
    title,
  ) {
    $scope.pages = {
      templateSelection: require('./templateSelection.html'),
      basicSettings: require('./basicSettings.html'),
      resources: require('./resources.html'),
      capacity: require('./capacity/capacity.html'),
      loadBalancers: require('./loadBalancers.html'),
      securityGroups: require('./securityGroups.html'),
      parameters: require('./parameters.html'),
    };

    $scope.firewallsLabel = FirewallLabels.get('Firewalls');

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
      let cloneStage = $scope.taskMonitor.task.execution.stages.find(stage => stage.type === 'cloneServerGroup');
      if (cloneStage && cloneStage.context['deploy.server.groups']) {
        let newServerGroupName = cloneStage.context['deploy.server.groups'][$scope.command.region];
        if (newServerGroupName) {
          var newStateParams = {
            serverGroup: newServerGroupName,
            accountId: $scope.command.credentials,
            region: $scope.command.region,
            provider: 'titus',
          };
          var transitionTo = '^.^.^.clusters.serverGroup';
          if ($state.includes('**.clusters.serverGroup')) {
            // clone via details, all view
            transitionTo = '^.serverGroup';
          }
          if ($state.includes('**.clusters.cluster.serverGroup')) {
            // clone or create with details open
            transitionTo = '^.^.serverGroup';
          }
          if ($state.includes('**.clusters')) {
            // create new, no details open
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

    $scope.taskMonitor = new TaskMonitor({
      application: application,
      title: 'Creating your server group',
      modalInstance: $uibModalInstance,
      onTaskComplete: onTaskComplete,
    });

    let securityGroupsRemoved = () => ModalWizard.markDirty('securityGroups');

    serverGroupCommand.deferredInitialization = true;
    function configureCommand() {
      titusServerGroupConfigurationService.configureCommand(serverGroupCommand).then(function() {
        serverGroupCommand.registry =
          serverGroupCommand.backingData.credentialsKeyedByAccount[serverGroupCommand.credentials].registry;
        $scope.state.loaded = true;
        serverGroupCommand.viewState.groupsRemovedStream.subscribe(securityGroupsRemoved);
      });
    }

    this.isValid = function() {
      return (
        $scope.command &&
        ($scope.command.viewState.disableImageSelection || $scope.command.imageId) &&
        $scope.command.credentials !== null &&
        $scope.command.region !== null &&
        $scope.command.capacity.desired !== null &&
        ModalWizard.isComplete()
      );
    };

    this.showSubmitButton = function() {
      return ModalWizard.allPagesVisited();
    };

    this.clone = function() {
      let command = angular.copy($scope.command);
      if ($scope.command.viewState.mode === 'editPipeline' || $scope.command.viewState.mode === 'createPipeline') {
        return $uibModalInstance.close(command);
      }
      $scope.taskMonitor.submit(function() {
        return serverGroupWriter.cloneServerGroup(command, application);
      });
    };

    this.cancel = function() {
      $uibModalInstance.dismiss();
    };

    if (!$scope.state.requiresTemplateSelection) {
      configureCommand();
    } else {
      $scope.state.loaded = true;
    }

    $scope.$on('template-selected', function() {
      $scope.state.requiresTemplateSelection = false;
      configureCommand();
    });
  });
