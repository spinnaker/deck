'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.pipelines.config.stage', [
  require('utils:lodash'),
  require('../pipelineConfigProvider.js'),
  require('../services/pipelineConfigService.js'),
  require('./overrideTimeout/overrideTimeout.directive.js'),
])
  .directive('pipelineConfigStage', function() {
    return {
      restrict: 'E',
      require: '^pipelineConfigurer',
      scope: {
        viewState: '=',
        application: '=',
        pipeline: '=',
      },
      controller: 'StageConfigCtrl as stageConfigCtrl',
      templateUrl: require('./stage.html'),
      link: function(scope, elem, attrs, pipelineConfigurerCtrl) {
        scope.pipelineConfigurerCtrl = pipelineConfigurerCtrl;
      }
    };
  })
  .controller('StageConfigCtrl', function($scope, $element, $compile, $controller, $templateCache,
                                          pipelineConfigService, pipelineConfig, _) {

    var stageTypes = pipelineConfig.getConfigurableStageTypes(),
        lastStageScope;
    $scope.options = {
      stageTypes: _.sortBy(stageTypes, function (stageType) {
        return stageType.label;
      }),
      selectedStageType: null,
    };

    function getConfig(type) {
      return pipelineConfig.getStageConfig({type: type});
    }

    $scope.groupDependencyOptions = function(stage) {
      return stage.available ? 'Available' :
        $scope.stage.requisiteStageRefIds.indexOf(stage.refId) === -1 ? 'Downstream dependencies (unavailable)' : null;
    };

    $scope.updateAvailableDependencyStages = function() {
      if (!$scope.pipeline.parallel) {
        return;
      }
      var availableDependencyStages = pipelineConfigService.getDependencyCandidateStages($scope.pipeline, $scope.stage);
      $scope.options.dependencies = availableDependencyStages.map(function(stage) {
        return {
          name: stage.name,
          refId: stage.refId,
          available: true,
        };
      });

      $scope.pipeline.stages.forEach(function(stage) {
        if (stage !== $scope.stage && availableDependencyStages.indexOf(stage) === -1) {
          $scope.options.dependencies.push({
            name: stage.name,
            refId: stage.refId,
          });
        }
      });
    };

    this.selectStageType = (type) => {
      $scope.stage.type = type;
      this.selectStage();
    };

    this.selectStage = function(newVal, oldVal) {
      if ($scope.viewState.stageIndex >= $scope.pipeline.stages.length) {
        $scope.viewState.stageIndex = $scope.pipeline.stages.length - 1;
      }
      $scope.stage = $scope.pipeline.stages[$scope.viewState.stageIndex];

      $scope.updateAvailableDependencyStages();
      var type = $scope.stage.type,
          stageScope = $scope.$new();

      // clear existing contents
      $element.find('.stage-details').html('');
      $scope.description = '';
      if (lastStageScope) {
        lastStageScope.$destroy();
      }
      lastStageScope = stageScope;
      $scope.$on('$destroy', function() {
        stageScope.$destroy();
      });

      if (type) {
        let config = getConfig(type);
        if (config) {
          $scope.description = config.description;
          $scope.label = config.label;
          if (config.useBaseProvider || config.provides) {
            config.templateUrl = require('./baseProviderStage/baseProviderStage.html');
            config.controller = 'BaseProviderStageCtrl as baseProviderStageCtrl';
          }
          updateStageName(config, oldVal);
          applyConfigController(config, stageScope);

          let template = $templateCache.get(config.templateUrl);
          let templateBody = $compile(template)(stageScope);
          $element.find('.stage-details').html(templateBody);
        }
      }
    };

    function applyConfigController(config, stageScope) {
      if (config.controller) {
        var ctrl = config.controller.split(' as ');
        var controller = $controller(ctrl[0], {$scope: stageScope, stage: $scope.stage, viewState: $scope.viewState});
        if (ctrl.length === 2) {
          stageScope[ctrl[1]] = controller;
        }
        if (config.controllerAs) {
          stageScope[config.controllerAs] = controller;
        }
      }
    }

    function updateStageName(config, oldVal) {
      // apply a default name if the type changes and the user has not specified a name
      if (oldVal) {
        var oldConfig = getConfig(oldVal);
        if (oldConfig && $scope.stage.name === oldConfig.label) {
          $scope.stage.name = config.label;
        }
      }
      if (!$scope.stage.name && config.label) {
        $scope.stage.name = config.label;
      }
    }

    $scope.$on('pipeline-reverted', this.selectStage);
    $scope.$on('pipeline-json-edited', this.selectStage);
    $scope.$on('pipeline-parallel-changed', this.selectStage);
    $scope.$watch('stage.type', this.selectStage);
    $scope.$watch('viewState.stageIndex', this.selectStage);
  })
  .name;
