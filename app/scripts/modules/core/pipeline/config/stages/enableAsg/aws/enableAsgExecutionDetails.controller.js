'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.pipelines.stage.enableAsg.aws.executionDetails.controller', [
  require('angular-ui-router'),
  require('../../../../../delivery/details/executionDetailsSection.service.js'),
  require('../../../../../delivery/details/executionDetailsSectionNav.directive.js'),
])
  .controller('awsEnableAsgExecutionDetailsCtrl', function ($scope, $stateParams, executionDetailsSectionService) {

    $scope.configSections = ['enableServerGroupConfig', 'taskStatus'];

    function initialize() {
      executionDetailsSectionService.synchronizeSection($scope.configSections);
      $scope.detailsSection = $stateParams.details;
    }

    initialize();

    $scope.$on('$stateChangeSuccess', initialize, true);

  });
