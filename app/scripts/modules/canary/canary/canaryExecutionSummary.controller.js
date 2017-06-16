'use strict';

const angular = require('angular');

import { PIPELINE_CONFIG_PROVIDER } from '@spinnaker/core';

module.exports = angular.module('spinnaker.canary.summary.controller', [
  require('@uirouter/angularjs').default,
  require('./actions/generateScore.controller.js'),
  require('./actions/endCanary.controller.js'),
  PIPELINE_CONFIG_PROVIDER
])
  .controller('CanaryExecutionSummaryCtrl', function ($scope, $http, $uibModal, pipelineConfig) {

    this.generateCanaryScore = function() {
      $uibModal.open({
        templateUrl: require('./actions/generateScore.modal.html'),
        controller: 'GenerateScoreCtrl as ctrl',
        resolve: {
          canaryId: function() { return $scope.stageSummary.masterStage.context.canary.id; },
        },
      });
    };

    this.endCanary = function() {
      $uibModal.open({
        templateUrl: require('./actions/endCanary.modal.html'),
        controller: 'EndCanaryCtrl as ctrl',
        resolve: {
          canaryId: function() { return $scope.stageSummary.masterStage.context.canary.id; },
        },
      });
    };

    this.isRestartable = function(stage) {
      var stageConfig = pipelineConfig.getStageConfig(stage);
      if (!stageConfig || stage.isRestarting === true) {
        return false;
      }

      return stageConfig.restartable || false;

    };

  });
