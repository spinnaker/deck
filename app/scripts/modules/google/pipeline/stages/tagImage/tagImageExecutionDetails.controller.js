'use strict';

import {EXECUTION_DETAILS_SECTION_SERVICE} from 'core/delivery/details/executionDetailsSection.service';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.pipeline.stage.tagImage.gce.executionDetails.controller', [
    require('angular-ui-router').default,
    EXECUTION_DETAILS_SECTION_SERVICE,
    require('core/delivery/details/executionDetailsSectionNav.directive.js'),
  ])
  .controller('gceTagImageExecutionDetailsCtrl', function ($scope, $stateParams, manualJudgmentService,
                                                           executionDetailsSectionService) {

    $scope.configSections = ['tagImageConfig', 'taskStatus'];

    let initialized = () => {
      $scope.detailsSection = $stateParams.details;
    };

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);

  });
