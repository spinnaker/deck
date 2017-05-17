'use strict';

const angular = require('angular');

import { SETTINGS } from '@spinnaker/core';

module.exports = angular.module('spinnaker.core.pipeline.stage.bake.gce.executionDetails.controller', [
  require('angular-ui-router').default,
])
  .controller('gceBakeExecutionDetailsCtrl', function ($scope, $stateParams, executionDetailsSectionService,
                                                       $interpolate) {

    $scope.configSections = ['bakeConfig', 'taskStatus'];

    let initialized = () => {
      $scope.detailsSection = $stateParams.details;
      $scope.provider = $scope.stage.context.cloudProviderType || 'gce';
      $scope.roscoMode = SETTINGS.feature.roscoMode;
      $scope.bakeryDetailUrl = $interpolate(SETTINGS.bakeryDetailUrl);
    };

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);

  });
