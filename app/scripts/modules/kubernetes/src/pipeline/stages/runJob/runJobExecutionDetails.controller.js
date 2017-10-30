'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.kubernetes.pipeline.stage.disableCluster.runJobExecutionDetails.controller', [
    require('@uirouter/angularjs').default,
  ])
  .controller('kubernetesRunJobExecutionDetailsCtrl', function ($scope, $stateParams, executionDetailsSectionService) {

    $scope.configSections = ['runJobConfig', 'taskStatus'];

    let initialized = () => {
      $scope.detailsSection = $stateParams.details;
    };

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);

  });
