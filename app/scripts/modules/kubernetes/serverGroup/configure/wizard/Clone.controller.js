'use strict';

let angular = require('angular');

import {V2_MODAL_WIZARD_SERVICE} from 'core/modal/wizard/v2modalWizard.service';
import {SERVER_GROUP_WRITER} from 'core/serverGroup/serverGroupWriter.service';
import {TASK_MONITOR_BUILDER} from 'core/task/monitor/taskMonitor.builder';

module.exports = angular.module('spinnaker.serverGroup.configure.kubernetes.clone', [
  require('angular-ui-router'),
  require('core/application/modal/platformHealthOverride.directive.js'),
  SERVER_GROUP_WRITER,
  V2_MODAL_WIZARD_SERVICE,
  TASK_MONITOR_BUILDER,
  require('../configuration.service.js'),
  require('core/modal/wizard/wizardSubFormValidation.service.js'),
])
  .controller('kubernetesCloneServerGroupController', function($scope, $uibModalInstance, $q, $state,
                                                               serverGroupWriter, v2modalWizardService, taskMonitorBuilder,
                                                               kubernetesServerGroupConfigurationService,
                                                               serverGroupCommand, application, title, $timeout,
                                                               wizardSubFormValidation) {
    $scope.pages = {
      templateSelection: require('./templateSelection.html'),
      basicSettings: require('./basicSettings.html'),
      deployment: require('./deployment.html'),
      loadBalancers: require('./loadBalancers.html'),
      replicas: require('./replicas.html'),
      volumes: require('./volumes.html'),
      advancedSettings: require('./advancedSettings.html'),
    };

    $scope.title = title;

    $scope.applicationName = application.name;
    $scope.application = application;

    $scope.command = serverGroupCommand;
    $scope.contextImages = serverGroupCommand.viewState.contextImages;

    $scope.state = {
      loaded: false,
      requiresTemplateSelection: !!serverGroupCommand.viewState.requiresTemplateSelection,
    };

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: 'Creating your server group',
      modalInstance: $uibModalInstance,
    });

    function configureCommand() {
      serverGroupCommand.viewState.contextImages = $scope.contextImages;
      $scope.contextImages = null;
      kubernetesServerGroupConfigurationService.configureCommand(application, serverGroupCommand).then(function () {
        $scope.state.loaded = true; // allows wizard directive to run (after digest).
        $timeout(initializeWizardState); // wait for digest.
        initializeWatches();
      });
    }

    function initializeWatches() {
      $scope.$watch('command.account', $scope.command.accountChanged);
      $scope.$watch('command.namespace', $scope.command.namespaceChanged);
    }

    function initializeWizardState() {
      var mode = serverGroupCommand.viewState.mode;
      if (mode === 'clone' || mode === 'editPipeline') {
        v2modalWizardService.markComplete('location');
        v2modalWizardService.markComplete('deployment');
        v2modalWizardService.markComplete('load-balancers');
        v2modalWizardService.markComplete('replicas');
        v2modalWizardService.markComplete('volumes');
      }

      wizardSubFormValidation
        .config({ scope: $scope, form: 'form' })
        .register({page: 'location', subForm: 'basicSettings'})
        .register({page: 'advanced-settings', subForm: 'advancedSettings'});
    }

    this.isValid = function () {
      return $scope.command && $scope.command.containers.length > 0 &&
        $scope.command.account !== null &&
        v2modalWizardService.isComplete() &&
        wizardSubFormValidation.subFormsAreValid();
    };

    this.showSubmitButton = function () {
      return v2modalWizardService.allPagesVisited();
    };

    this.clone = function () {
      if ($scope.command.viewState.mode === 'editPipeline' || $scope.command.viewState.mode == 'createPipeline') {
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

    $scope.$on('template-selected', function() {
      $scope.state.requiresTemplateSelection = false;
      configureCommand();
    });
  });
