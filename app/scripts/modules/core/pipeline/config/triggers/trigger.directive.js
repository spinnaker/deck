'use strict';

import {SETTINGS} from 'core/config/settings';
import {PIPELINE_CONFIG_PROVIDER} from 'core/pipeline/config/pipelineConfigProvider';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.trigger.triggerDirective', [
  PIPELINE_CONFIG_PROVIDER
])
  .directive('trigger', function() {
    return {
      restrict: 'E',
      require: '^pipelineConfigurer',
      scope: {
        trigger: '=',
        pipeline: '=',
        application: '='
      },
      controller: 'TriggerCtrl as triggerCtrl',
      templateUrl: require('./trigger.html'),
      link: function(scope, elem, attrs, pipelineConfigurerCtrl) {
        scope.pipelineConfigurerCtrl = pipelineConfigurerCtrl;
      }
    };
  })
  .controller('TriggerCtrl', function($scope, $element, pipelineConfig, $compile, $controller, $templateCache) {
    var triggerTypes = pipelineConfig.getTriggerTypes();
    $scope.options = triggerTypes;

    this.disableAutoTriggering = SETTINGS.disableAutoTriggering || [];

    this.removeTrigger = function(trigger) {
      var triggerIndex = $scope.pipeline.triggers.indexOf(trigger);
      $scope.pipeline.triggers.splice(triggerIndex, 1);
    };

    this.loadTrigger = () => {
      var type = $scope.trigger.type,
          triggerScope = $scope.$new();
      if (type) {
        if (this.disableAutoTriggering.includes(type)) {
          $scope.trigger.enabled = false;
        }
        var triggerConfig = triggerTypes.filter(function(config) {
          return config.key === type;
        });
        if (triggerConfig.length) {
          var config = triggerConfig[0],
              template = $templateCache.get(config.templateUrl);
          $scope.description = config.description;
          if (config.controller) {
            var ctrl = config.controller.split(' as ');
            var controller = $controller(ctrl[0], {$scope: triggerScope, trigger: $scope.trigger});
            if (ctrl.length === 2) {
              triggerScope[ctrl[1]] = controller;
            }
            if (config.controllerAs) {
              triggerScope[config.controllerAs] = controller;
            }
          }

          var templateBody = $compile(template)(triggerScope);
          $element.find('.trigger-body').html(templateBody);
        }
      }
    };

    this.loadTrigger();
  });
