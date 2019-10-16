'use strict';

import { Registry } from 'core/registry';
import { SETTINGS } from 'core/config/settings';

import { ManualJudgmentExecutionDetails } from './ManualJudgmentExecutionDetails';
import { ManualJudgmentExecutionLabel } from './ManualJudgmentExecutionLabel';
import { ManualJudgmentMarkerIcon } from './ManualJudgmentMarkerIcon';
import { ExecutionDetailsTasks } from '../common/ExecutionDetailsTasks';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.pipeline.stage.manualJudgmentStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      label: 'Manual Judgment',
      description: 'Waits for user approval before continuing',
      key: 'manualJudgment',
      restartable: true,
      controller: 'ManualJudgmentStageCtrl',
      controllerAs: 'manualJudgmentStageCtrl',
      templateUrl: require('./manualJudgmentStage.html'),
      executionDetailsSections: [ManualJudgmentExecutionDetails, ExecutionDetailsTasks],
      executionLabelComponent: ManualJudgmentExecutionLabel,
      useCustomTooltip: true,
      markerIcon: ManualJudgmentMarkerIcon,
      strategy: true,
      supportsCustomTimeout: true,
      disableNotifications: true,
    });
  })
  .controller('ManualJudgmentStageCtrl', [
    '$scope',
    '$uibModal',
    function($scope) {
      $scope.authEnabled = SETTINGS.authEnabled;
      $scope.stage.notifications = $scope.stage.notifications || [];
      $scope.stage.judgmentInputs = $scope.stage.judgmentInputs || [];
      $scope.stage.failPipeline = $scope.stage.failPipeline === undefined ? true : $scope.stage.failPipeline;

      this.transformToNewStyleIfNecessary = function(notifications) {
        // If there is at least one notification, and sendNotifications is not enabled, this must be the old style; transform it.
        if (notifications.length && !$scope.stage.sendNotifications) {
          _.each(notifications, function(notification) {
            notification.level = 'stage';
            notification.when = ['manualJudgment'];
          });
          $scope.stage.sendNotifications = true;
        }
      };

      this.transformToNewStyleIfNecessary($scope.stage.notifications);

      this.manageStateOnToggle = function() {
        if (!$scope.stage.sendNotifications) {
          $scope.stage.notifications.length = 0;
        }
      };

      this.addJudgmentInput = function() {
        if (!$scope.stage.judgmentInputs) {
          $scope.stage.judgmentInputs = [];
        }
        var judgmentInput = {};
        $scope.stage.judgmentInputs.push(judgmentInput);
      };

      this.removeJudgmentInput = function(idx) {
        $scope.stage.judgmentInputs.splice(idx, 1);
      };

      this.updateNotifications = function(notifications) {
        if ($scope.parent && !$scope.parent.notifications) {
          $scope.parent.notifications = [];
        }
        $scope.stage.notifications = notifications;
        $scope.$digest();
      };
    },
  ]);
