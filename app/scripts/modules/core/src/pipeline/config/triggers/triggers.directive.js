'use strict';

import {PIPELINE_CONFIG_PROVIDER} from 'core/pipeline/config/pipelineConfigProvider';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.trigger.triggersDirective', [
  PIPELINE_CONFIG_PROVIDER,
])
  .directive('triggers', function() {
    return {
      restrict: 'E',
      scope: {
        pipeline: '=',
        application: '='
      },
      controller: 'triggersCtrl',
      controllerAs: 'triggersCtrl',
      templateUrl: require('./triggers.html')
    };
  })
  .controller('triggersCtrl', function($scope, pipelineConfig) {
    this.addTrigger = function() {
      var triggerTypes = pipelineConfig.getTriggerTypes(),
          newTrigger = {enabled: true};
      if (!$scope.pipeline.triggers) {
        $scope.pipeline.triggers = [];
      }

      if (triggerTypes.length === 1) {
        newTrigger.type = triggerTypes[0].key;
      }
      $scope.pipeline.triggers.push(newTrigger);
    };


  });
