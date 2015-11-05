'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.quickPatchAsg.executionDetails.controller', [
  require('angular-ui-router'),
  require('../../../../delivery'),
])
  .controller('QuickPatchAsgExecutionDetailsCtrl', function ($scope, $stateParams, executionDetailsSectionService) {

    $scope.configSections = ['quickPatchServerGroupConfig'];

    function initialize() {
      executionDetailsSectionService.synchronizeSection($scope.configSections);
      $scope.detailsSection = $stateParams.details;
    }

    initialize();

    $scope.$on('$stateChangeSuccess', initialize, true);

  });
