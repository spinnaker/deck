'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.pipeline.stage.canary.acaTaskExecution.details.controller', [
  require('angular-ui-router'),
  require('../../../../../core/utils/lodash.js'),
  require('../../../../../core/delivery/details/executionDetailsSection.service.js'),
  require('../../../../../core/delivery/details/executionDetailsSectionNav.directive.js'),
  require('../../../../../core/navigation/urlBuilder.service.js'),
  require('../../canary/canaryDeployment/canaryDeploymentHistory.service.js')
])
  .controller('AcaTaskExecutionDetailsCtrl', function ($scope, _, $stateParams, $timeout,
                                                                executionDetailsSectionService,
                                                                canaryDeploymentHistoryService, urlBuilderService,
                                                                clusterFilterService) {

    function initialize() {

      $scope.configSections = ['canaryDeployment', 'canaryAnalysisHistory'];

      $scope.deployment = $scope.stage.context;

      $scope.viewState = {
        loadingHistory: true,
        loadingHistoryError: false,
      };

      executionDetailsSectionService.synchronizeSection($scope.configSections);
      $scope.detailsSection = $stateParams.details;


      $scope.loadHistory();
    }

    $scope.loadHistory = function () {

      if ($scope.deployment.canary.canaryDeployments.length > 0) {
        $scope.viewState.loadingHistory = true;
        $scope.viewState.loadingHistoryError = false;

        var canaryDeploymentId = $scope.deployment.canary.canaryDeployments[0].id;
        canaryDeploymentHistoryService.getAnalysisHistory(canaryDeploymentId).then(
          function (results) {
            $scope.analysisHistory = results;
            $scope.viewState.loadingHistory = false;
          },
          function () {
            $scope.viewState.loadingHistory = false;
            $scope.viewState.loadingHistoryError = true;
          }
        );
      } else {
        $scope.analysisHistory = [];
        $scope.viewState.loadingHistory = false;
      }
    };

    this.overrideFiltersForUrl = clusterFilterService.overrideFiltersForUrl;

    this.overrideFiltersForUrl = clusterFilterService.overrideFiltersForUrl;

    initialize();

    $scope.$on('$stateChangeSuccess',
      function () {
        $timeout(initialize);
      },
      true);

  });
