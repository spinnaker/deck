'use strict';

import { EXECUTION_DETAILS_SECTION_SERVICE } from '@spinnaker/core';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.disableCluster.dcos.executionDetails.controller', [
  EXECUTION_DETAILS_SECTION_SERVICE,
])
  .controller('dcosDisableClusterExecutionDetailsCtrl', function ($scope, $stateParams, executionDetailsSectionService) {

    $scope.configSections = ['disableClusterConfig', 'taskStatus'];

    let initialized = () => {
      $scope.detailsSection = $stateParams.details;
    };

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);

  });
