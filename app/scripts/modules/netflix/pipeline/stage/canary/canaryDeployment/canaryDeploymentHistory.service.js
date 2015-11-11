'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.pipeline.stages.canary.deployment.history.service', [
])
  .factory('canaryDeploymentHistoryService', function (Restangular) {

    function getAnalysisHistory(canaryDeploymentId) {
      return Restangular.one('canaryDeployments').one(canaryDeploymentId).all('canaryAnalysisHistory').getList();
    }

    return {
      getAnalysisHistory: getAnalysisHistory,
    };

  }).name;
