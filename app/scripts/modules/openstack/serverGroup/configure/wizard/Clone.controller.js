'use strict';

const angular = require('angular');

import { SERVER_GROUP_WRITER, TASK_MONITOR_BUILDER, V2_MODAL_WIZARD_SERVICE } from '@spinnaker/core';

module.exports = angular.module('spinnaker.openstack.serverGroup.configure.clone', [
  require('@uirouter/angularjs').default,
  SERVER_GROUP_WRITER,
  V2_MODAL_WIZARD_SERVICE,
  TASK_MONITOR_BUILDER,
  require('../serverGroupConfiguration.service.js'),
])
  .controller('openstackCloneServerGroupCtrl', function($scope, $uibModalInstance, $q, $state,
                                                        serverGroupWriter, v2modalWizardService, taskMonitorBuilder,
                                                        openstackServerGroupConfigurationService,
                                                        serverGroupCommand, application, title) {
    $scope.pages = {
      templateSelection: require('./templateSelection.html'),
      basicSettings: require('./location/basicSettings.html'),
      instanceSettings: require('./instance/instanceSettings.html'),
      clusterSettings: require('./clusterSettings.html'),
      accessSettings: require('./access/accessSettings.html'),
      advancedSettings: require('./advanced/advancedSettings.html')
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

    this.templateSelectionText = {
      copied: [
        'account, namespace, cluster name (stack, details)',
        'load balancers',
        'security groups',
        'container configuration',
      ],
      notCopied: [],
    };

    if (!$scope.command.viewState.disableStrategySelection) {
      this.templateSelectionText.notCopied.push('the deployment strategy (if any) used to deploy the most recent server group');
    }

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: 'Creating your server group',
      modalInstance: $uibModalInstance,
    });

    function configureCommand() {
      serverGroupCommand.viewState.contextImages = $scope.contextImages;
      $scope.contextImages = null;
      openstackServerGroupConfigurationService.configureCommand(application, serverGroupCommand).then(function() {
        $scope.state.loaded = true;
        initializeWizardState();
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
        v2modalWizardService.markComplete('access-settings');
      }
    }

    this.isValid = function () {
      return $scope.command &&
        $scope.command.account !== null &&
        v2modalWizardService.isComplete();
    };

    this.showSubmitButton = function () {
      return v2modalWizardService.allPagesVisited();
    };

    this.submit = function () {
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

    this.templateSelected = () => {
      $scope.state.requiresTemplateSelection = false;
      configureCommand();
    };
  });
