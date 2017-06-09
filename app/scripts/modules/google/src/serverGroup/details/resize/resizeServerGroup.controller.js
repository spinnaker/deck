'use strict';

const angular = require('angular');

import { TASK_MONITOR_BUILDER } from '@spinnaker/core';

module.exports = angular.module('spinnaker.google.serverGroup.details.resize.controller', [
  TASK_MONITOR_BUILDER,
  require('./resizeCapacity.component.js'),
  require('./resizeAutoscalingPolicy.component.js'),
  require('../../../common/footer.directive.js'),
])
  .controller('gceResizeServerGroupCtrl', function($scope, $uibModalInstance, taskMonitorBuilder,
                                                   application, serverGroup) {
    $scope.serverGroup = serverGroup;
    $scope.application = application;
    $scope.verification = {};
    $scope.command = {};
    $scope.formMethods = {};

    if (application && application.attributes) {
      if (application.attributes.platformHealthOnlyShowOverride && application.attributes.platformHealthOnly) {
        $scope.command.interestingHealthProviderNames = ['Google'];
      }

      $scope.command.platformHealthOnlyShowOverride = application.attributes.platformHealthOnlyShowOverride;
    }

    this.isValid = function () {
      if (!$scope.verification.verified) {
        return false;
      }
      return $scope.formMethods.formIsValid();
    };

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: 'Resizing ' + serverGroup.name,
      modalInstance: $uibModalInstance,
    });

    this.resize = function () {
      this.submitting = true;
      if (!this.isValid()) {
        return;
      }

      $scope.taskMonitor.submit($scope.formMethods.submitMethod);
    };

    this.cancel = function () {
      $uibModalInstance.dismiss();
    };
  });
