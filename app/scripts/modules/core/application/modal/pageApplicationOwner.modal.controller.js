'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.pageApplicationOwner.modal.controller', [
  require('../service/applications.write.service.js'),
  require('core/task/monitor/taskMonitorService.js'),
])
  .controller('PageApplicationOwner', function ($scope, $uibModalInstance,
                                                taskMonitorService, applicationWriter, application) {
    this.application = application;
    this.command = {};

    this.submit = () => {
      var taskMonitorConfig = {
        application: application,
        title: 'Paging ' + application.name + ' owner',
        modalInstance: $uibModalInstance
      };

      var submitMethod = () => {
        var reason = '[' + this.application.name.toUpperCase() + '] ' + this.command.reason;
        return applicationWriter.pageApplicationOwner(
          this.application, reason
        );
      };

      this.taskMonitor = taskMonitorService.buildTaskMonitor(taskMonitorConfig);
      this.taskMonitor.submit(submitMethod);
    };
  });
