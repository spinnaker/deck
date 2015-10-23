'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.bake.aws.executionDetails.controller', [
  require('angular-ui-router'),
  require('../../../../../delivery/details/executionDetailsSection.service.js'),
  require('../../../../../delivery/details/executionDetailsSectionNav.directive.js'),
  require('../../../../../../netflix/bakery/index.js'),
])
  .controller('awsBakeExecutionDetailsCtrl', function ($scope, $stateParams, executionDetailsSectionService, $timeout,
                                                       $interpolate, bakeryProvider) {

    $scope.configSections = ['bakeConfig', 'taskStatus'];

    function initialize() {
      executionDetailsSectionService.synchronizeSection($scope.configSections);
      $scope.detailsSection = $stateParams.details;

      // When this is called from a stateChangeSuccess event, the stage in the scope is not updated in this digest cycle
      // so we need to wait until the next cycle to update any scope values based on the stage
      $timeout(function() {
        $scope.provider = $scope.stage.context.cloudProviderType || 'aws';
      });

      $scope.bakeryDetailUrl = $interpolate(bakeryProvider.getDetailUrl());
    }

    initialize();

    $scope.$on('$stateChangeSuccess', initialize, true);

  });
