'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.validator.directive', [
  require('./pipelineConfigValidation.service.js'),
])
  .directive('pipelineConfigErrors', function() {
    return {
      restrict: 'E',
      templateUrl: require('./pipelineConfigErrors.html'),
      scope: {
        pipeline: '='
      },
      controller: 'PipelineConfigValidatorCtrl',
      controllerAs: 'validatorCtrl',
    };
  })
  .controller('PipelineConfigValidatorCtrl', function($scope, pipelineConfigValidator) {

    function validate() {
      pipelineConfigValidator.validatePipeline($scope.pipeline).then(messages => $scope.messages = messages);
    }

    pipelineConfigValidator.clearCache();

    $scope.$watch('pipeline', validate, true);

    $scope.popover = { show: false };

  });
