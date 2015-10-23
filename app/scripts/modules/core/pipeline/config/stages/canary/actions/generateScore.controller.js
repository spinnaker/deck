'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.canary.actions.generate.score.controller', [
  require('angular-ui-router'),
  require('../../../../../utils/lodash.js'),
  require('../../../../../delivery/details/executionDetailsSection.service.js'),
  require('../../../../../delivery/details/executionDetailsSectionNav.directive.js'),
  require('../../../../../apiHost'),
])
  .controller('GenerateScoreCtrl', function ($scope, $http, $modalInstance, apiHostProvider, canaryId, _) {

    $scope.command = {
      duration: null,
      durationUnit: 'h'
    };

    $scope.state = 'editing';

    this.generateCanaryScore = function() {
      $scope.state = 'submitting';
      var targetUrl = [apiHostProvider.baseUrl(), 'canaries', canaryId, 'generateCanaryResult'].join('/');
      $http.post(targetUrl, $scope.command)
        .success(function() {
          $scope.state = 'success';
        })
        .error(function() {
          $scope.state = 'error';
        });
    };

    this.cancel = $modalInstance.dismiss;

  });
