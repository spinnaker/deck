'use strict';

const angular = require('angular');

import { TaskExecutor, TASK_MONITOR_BUILDER } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.amazon.serverGroup.editAsgAdvancedSettings.modal.controller', [
    TASK_MONITOR_BUILDER,
    require('../../configure/serverGroupCommandBuilder.service.js').name,
  ])
  .controller('EditAsgAdvancedSettingsCtrl', function(
    $scope,
    $uibModalInstance,
    taskMonitorBuilder,
    application,
    serverGroup,
    awsServerGroupCommandBuilder,
  ) {
    $scope.command = awsServerGroupCommandBuilder.buildUpdateServerGroupCommand(serverGroup);

    $scope.serverGroup = serverGroup;

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: 'Update Advanced Settings for ' + serverGroup.name,
      modalInstance: $uibModalInstance,
      onTaskComplete: () => application.serverGroups.refresh(),
    });

    this.submit = () => {
      var job = [$scope.command];

      var submitMethod = function() {
        return TaskExecutor.executeTask({
          job: job,
          application: application,
          description: 'Update Advanced Settings for ' + serverGroup.name,
        });
      };

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = $uibModalInstance.dismiss;
  });
