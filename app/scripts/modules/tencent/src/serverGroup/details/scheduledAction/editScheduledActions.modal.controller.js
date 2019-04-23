'use strict';

const angular = require('angular');

import { TaskExecutor, TaskMonitor } from '@spinnaker/core';
import { format } from 'date-fns';
module.exports = angular
  .module('spinnaker.tencent.serverGroup.details.scheduledActions.editScheduledActions.modal.controller', [])
  .controller('tencentEditScheduledActionsCtrl', [
    '$scope',
    '$uibModalInstance',
    'application',
    'serverGroup',
    function($scope, $uibModalInstance, application, serverGroup) {
      $scope.command = {
        scheduledActions: serverGroup.scheduledActions.map(action => {
          return {
            scheduledActionId: action.scheduledActionId,
            startTime: new Date(action.startTime),
            endTime: action.endTime == '0000-00-00T00:00:00+08:00' ? undefined : new Date(action.endTime),
            repeat: action.recurrence && action.endTime != '0000-00-00T00:00:00+08:00' ? 'Yes' : 'No',
            recurrence: action.recurrence,
            minSize: action.minSize,
            maxSize: action.maxSize,
            desiredCapacity: action.desiredCapacity,
            operationType: 'MODIFY',
          };
        }),
      };

      $scope.serverGroup = serverGroup;

      this.addScheduledAction = () => {
        $scope.command.scheduledActions.push({
          repeat: 'No',
          operationType: 'CREATE',
        });
      };

      this.removeScheduledAction = index => {
        $scope.command.scheduledActions.splice(index, 1);
      };

      this.isRepeatChange = action => {
        if (action.repeat == 'No') {
          (action.recurrence = ''), (action.endTime = '');
        }
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Update Scheduled Actions for ' + serverGroup.name,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.serverGroups.refresh(),
      });

      let getBeijingTime = date => {
        const timezone = 8; //目标时区时间，东八区
        const offset_GMT = new Date().getTimezoneOffset(); // 本地时间和格林威治的时间差，单位为分钟
        const nowDate = new Date(date).getTime(); // 本地时间距 1970 年 1 月 1 日午夜（GMT 时间）之间的毫秒数
        return format(
          new Date(nowDate + offset_GMT * 60 * 1000 + timezone * 60 * 60 * 1000),
          'YYYY-MM-DDTHH:mm:ss+08:00',
        );
      };

      this.submit = () => {
        var job = $scope.command.scheduledActions.map(sa => ({
          type: 'upsertTencentScheduledActions',
          application: application.name,
          account: serverGroup.account,
          accountName: serverGroup.account,
          credentials: serverGroup.account,
          cloudProvider: 'tencent',
          region: serverGroup.region,
          serverGroupName: serverGroup.name,
          scheduledActionId: sa.scheduledActionId,
          operationType: sa.operationType,
          minSize: sa.minSize,
          maxSize: sa.maxSize,
          desiredCapacity: sa.desiredCapacity,
          startTime: getBeijingTime(sa.startTime),
          endTime: sa.repeat == 'Yes' && sa.recurrence ? getBeijingTime(sa.endTime) : '0000-00-00T00:00:00+08:00',
          recurrence: sa.repeat == 'Yes' ? sa.recurrence : '* * * * *',
        }));

        var submitMethod = function() {
          return TaskExecutor.executeTask({
            job: job,
            application: application,
            description: 'Update Scheduled Actions for ' + serverGroup.name,
          });
        };

        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = $uibModalInstance.dismiss;
    },
  ]);
