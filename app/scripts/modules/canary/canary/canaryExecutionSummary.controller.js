'use strict';

import { module } from 'angular';

import { Registry } from '@spinnaker/core';
import { CANARY_CANARY_ACTIONS_GENERATESCORE_CONTROLLER } from './actions/generateScore.controller';
import { CANARY_CANARY_ACTIONS_ENDCANARY_CONTROLLER } from './actions/endCanary.controller';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

export const CANARY_CANARY_CANARYEXECUTIONSUMMARY_CONTROLLER = 'spinnaker.canary.summary.controller';
export const name = CANARY_CANARY_CANARYEXECUTIONSUMMARY_CONTROLLER; // for backwards compatibility
module(CANARY_CANARY_CANARYEXECUTIONSUMMARY_CONTROLLER, [
  UIROUTER_ANGULARJS,
  CANARY_CANARY_ACTIONS_GENERATESCORE_CONTROLLER,
  CANARY_CANARY_ACTIONS_ENDCANARY_CONTROLLER,
]).controller('CanaryExecutionSummaryCtrl', [
  '$scope',
  '$http',
  '$uibModal',
  function ($scope, $http, $uibModal) {
    this.generateCanaryScore = function () {
      $uibModal.open({
        templateUrl: require('./actions/generateScore.modal.html'),
        controller: 'GenerateScoreCtrl as ctrl',
        resolve: {
          canaryId: function () {
            return $scope.stageSummary.masterStage.context.canary.id;
          },
        },
      });
    };

    this.endCanary = function () {
      $uibModal.open({
        templateUrl: require('./actions/endCanary.modal.html'),
        controller: 'EndCanaryCtrl as ctrl',
        resolve: {
          canaryId: function () {
            return $scope.stageSummary.masterStage.context.canary.id;
          },
        },
      });
    };

    this.isRestartable = function (stage) {
      const stageConfig = Registry.pipeline.getStageConfig(stage);
      if (!stageConfig || stage.isRestarting === true) {
        return false;
      }

      return stageConfig.restartable || false;
    };
  },
]);
