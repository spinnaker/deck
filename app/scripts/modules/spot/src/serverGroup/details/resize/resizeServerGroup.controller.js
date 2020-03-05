'use strict';

import * as angular from 'angular';

import { SERVER_GROUP_WRITER, TaskMonitor } from '@spinnaker/core';

import { SPOT_RESIZE_CAPACITY_COMPONENT } from './resizeCapacity.component';

export const SPOT_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER =
  'spinnaker.spot.serverGroup.details.resize.controller';
export const name = SPOT_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER; // for backwards compatibility
angular
  .module(SPOT_SERVERGROUP_DETAILS_RESIZE_RESIZESERVERGROUP_CONTROLLER, [
    SERVER_GROUP_WRITER,
    SPOT_RESIZE_CAPACITY_COMPONENT,
  ])
  .controller('spotResizeServerGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    'serverGroupWriter',
    'application',
    'serverGroup',
    function($scope, $uibModalInstance, serverGroupWriter, application, serverGroup) {
      $scope.serverGroup = serverGroup;
      $scope.currentSize = {
        min: serverGroup.capacity.min,
        max: serverGroup.capacity.max,
        desired: serverGroup.capacity.desired,
        newSize: null,
      };

      $scope.verification = {};

      $scope.command = angular.copy($scope.currentSize);
      $scope.command.advancedMode = serverGroup.capacity.min !== serverGroup.capacity.max;

      if (application && application.attributes) {
        if (application.attributes.platformHealthOnlyShowOverride && application.attributes.platformHealthOnly) {
          $scope.command.interestingHealthProviderNames = ['Spot'];
        }

        $scope.command.platformHealthOnlyShowOverride = application.attributes.platformHealthOnlyShowOverride;
      }

      this.isValid = function() {
        const command = $scope.command;
        if (!$scope.verification.verified) {
          return false;
        }
        return command.advancedMode
          ? command.min <= command.max && command.desired >= command.min && command.desired <= command.max
          : command.newSize !== null;
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Resizing ' + serverGroup.name,
        modalInstance: $uibModalInstance,
      });

      this.resize = function() {
        if (!this.isValid()) {
          return;
        }
        let capacity = { min: $scope.command.min, max: $scope.command.max, desired: $scope.command.desired };
        if (!$scope.command.advancedMode) {
          capacity = { min: $scope.command.newSize, max: $scope.command.newSize, desired: $scope.command.newSize };
        }

        const submitMethod = function() {
          return serverGroupWriter.resizeServerGroup(serverGroup, application, {
            elastigroupId: serverGroup.elastigroup.id,
            capacity: capacity,
            interestingHealthProviderNames: $scope.command.interestingHealthProviderNames,
            reason: $scope.command.reason,
          });
        };

        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };
    },
  ]);
