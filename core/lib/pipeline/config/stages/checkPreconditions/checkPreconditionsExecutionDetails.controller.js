'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.pipelines.stage.checkPreconditions.executionDetails.controller', [
  require('angular-ui-router'),
  require('../../../../delivery'),
])
  .controller('CheckPreconditionsExecutionDetailsCtrl', function ($scope, $stateParams, $http, settings, executionDetailsSectionService, _) {
    $scope.configSections = ['checkPreconditions', 'taskStatus'];

    function initialize() {
      executionDetailsSectionService.synchronizeSection($scope.configSections);
      $scope.detailsSection = $stateParams.details;
    }

    initialize();
    $scope.$on('$stateChangeSuccess', initialize, true);

  });
