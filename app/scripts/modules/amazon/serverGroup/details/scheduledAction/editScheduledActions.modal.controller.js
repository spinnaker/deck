'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.details.aws.scheduledActions.editScheduledActions.modal.controller', [
  require('../../../../core/utils/lodash.js'),
  require('../../../../core/task/monitor/taskMonitor.module.js'),
  require('../../../../core/task/taskExecutor.js'),
])
  .controller('EditScheduledActionsCtrl', function($scope, $uibModalInstance, taskMonitorService, taskExecutor, _,
                                                     application, serverGroup) {
    $scope.command = {
      scheduledActions: serverGroup.scheduledActions.map((action) => {
        return {
          recurrence: action.recurrence,
          minSize: action.minSize,
          maxSize: action.maxSize,
          desiredCapacity: action.desiredCapacity,
        };
      }),
    };

    $scope.serverGroup = serverGroup;

    this.addScheduledAction = () => {
      $scope.command.scheduledActions.push({});
    };

    this.removeScheduledAction = (index) => {
      $scope.command.scheduledActions.splice(index, 1);
    };

    this.submit = () => {
      var job = [
        {
          type: 'upsertAsgScheduledActions',
          asgs: [{asgName: serverGroup.name, region: serverGroup.region}],
          scheduledActions: $scope.command.scheduledActions,
          credentials: serverGroup.account,
        }
      ];

      var submitMethod = function() {
        return taskExecutor.executeTask({
          job: job,
          application: application,
          description: 'Update Scheduled Actions for ' + serverGroup.name
        });
      };

      var taskMonitorConfig = {
        modalInstance: $uibModalInstance,
        application: application,
        title: 'Update Scheduled Actions for ' + serverGroup.name,
        onTaskComplete: application.serverGroups.refresh,
      };

      $scope.taskMonitor = taskMonitorService.buildTaskMonitor(taskMonitorConfig);

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = $uibModalInstance.dismiss;
  });
