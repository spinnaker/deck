'use strict';

const angular = require('angular');

import { SERVER_GROUP_WRITER, TaskMonitor } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.cf.serverGroup.details.rollback.controller', [
    SERVER_GROUP_WRITER,
    require('../../../common/footer.directive.js').name,
  ])
  .controller('cfRollbackServerGroupCtrl', function(
    $scope,
    $uibModalInstance,
    serverGroupWriter,
    application,
    serverGroup,
    disabledServerGroups,
  ) {
    $scope.serverGroup = serverGroup;
    $scope.disabledServerGroups = disabledServerGroups.sort((a, b) => b.name.localeCompare(a.name));
    $scope.verification = {};

    $scope.command = {
      rollbackType: 'EXPLICIT',
      rollbackContext: {
        rollbackServerGroupName: serverGroup.name,
      },
      region: serverGroup.region,
    };

    if (application && application.attributes) {
      $scope.command.platformHealthOnlyShowOverride = application.attributes.platformHealthOnlyShowOverride;
      $scope.command.interestingHealthProviderNames = ['Cloud Foundry'];
    }

    this.isValid = function() {
      var command = $scope.command;
      if (!$scope.verification.verified) {
        return false;
      }

      return command.rollbackContext.restoreServerGroupName !== undefined;
    };

    $scope.taskMonitor = new TaskMonitor({
      application: application,
      title: 'Rollback ' + serverGroup.name,
      modalInstance: $uibModalInstance,
    });

    this.rollback = function() {
      this.submitting = true;
      if (!this.isValid()) {
        return;
      }

      var submitMethod = function() {
        return serverGroupWriter.rollbackServerGroup(serverGroup, application, $scope.command);
      };

      $scope.taskMonitor.submit(submitMethod);
    };

    this.cancel = function() {
      $uibModalInstance.dismiss();
    };
  });
