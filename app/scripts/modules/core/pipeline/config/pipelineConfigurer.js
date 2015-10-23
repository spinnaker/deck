'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.pipelineConfigurer', [
])
  .directive('pipelineConfigurer', function() {
    return {
      restrict: 'E',
      scope: {
        pipeline: '=',
        application: '='
      },
      controller: 'PipelineConfigurerCtrl as pipelineConfigurerCtrl',
      templateUrl: require('./pipelineConfigurer.html'),
    };
  })
  .controller('PipelineConfigurerCtrl', function($scope, $uibModal, $timeout, _,
                                                 dirtyPipelineTracker, pipelineConfigService, viewStateCache) {

    var configViewStateCache = viewStateCache.pipelineConfig;

    function buildCacheKey() {
      return pipelineConfigService.buildViewStateCacheKey($scope.application.name, $scope.pipeline.name);
    }

    $scope.viewState = configViewStateCache.get(buildCacheKey()) || {
      expanded: true,
      section: 'triggers',
      stageIndex: 0,
      originalPipelineName: $scope.pipeline.name,
      saving: false,
    };

    this.enableParallel = function() {
      $uibModal.open({
        templateUrl: require('./actions/enableParallel/enableParallel.html'),
        controller: 'EnableParallelModalCtrl',
        controllerAs: 'enableParallelModalCtrl',
        resolve: {
          pipeline: function() { return $scope.pipeline; },
        }
      }).result.then(function() {
          $scope.$broadcast('pipeline-parallel-changed');
        });
    };

    this.disableParallel = function() {
      $uibModal.open({
        templateUrl: require('./actions/disableParallel/disableParallel.html'),
        controller: 'DisableParallelModalCtrl',
        controllerAs: 'disableParallelModalCtrl',
        resolve: {
          pipeline: function() { return $scope.pipeline; },
        }
      }).result.then(function() {
          $scope.$broadcast('pipeline-parallel-changed');
        });
    };

    this.deletePipeline = function() {
      $uibModal.open({
        templateUrl: require('./actions/delete/deletePipelineModal.html'),
        controller: 'DeletePipelineModalCtrl',
        controllerAs: 'deletePipelineModalCtrl',
        resolve: {
          pipeline: function() { return $scope.pipeline; },
          application: function() { return $scope.application; }
        }
      });
    };

    this.addStage = function() {
      var newStage = { isNew: true };
      $scope.pipeline.stages = $scope.pipeline.stages || [];
      if ($scope.pipeline.parallel) {
        $scope.pipeline.stageCounter++;
        newStage.requisiteStageRefIds = [];
        newStage.refId = $scope.pipeline.stageCounter + ''; // needs to be a string
        if ($scope.pipeline.stages.length && $scope.viewState.section === 'stage') {
          newStage.requisiteStageRefIds.push($scope.pipeline.stages[$scope.viewState.stageIndex].refId);
        }
      }
      $scope.pipeline.stages.push(newStage);
      this.navigateToStage($scope.pipeline.stages.length - 1);
    };

    var ctrl = this;
    $scope.stageSortOptions = {
      axis: 'x',
      delay: 150,
      placeholder: 'btn btn-default drop-placeholder',
      'ui-floating': true,
      start: function(e, ui) {
        ui.placeholder.width(ui.helper.width()).height(ui.helper.height());
      },
      update: function(e, ui) {
        var itemScope = ui.item.scope(),
          currentPage = $scope.viewState.stageIndex,
          startingPagePosition = itemScope.$index,
          isCurrentPage = currentPage === startingPagePosition;

        $timeout(function() {
          itemScope = ui.item.scope(); // this is terrible but provides a hook for mocking in tests
          var newPagePosition = itemScope.$index;
          if (isCurrentPage) {
            ctrl.navigateToStage(newPagePosition);
          } else {
            var wasBefore = startingPagePosition < currentPage,
              isBefore = newPagePosition <= currentPage;
            if (wasBefore !== isBefore) {
              var newCurrentPage = isBefore ? currentPage + 1 : currentPage - 1;
              ctrl.navigateToStage(newCurrentPage);
            }
          }
        });
      }
    };

    this.renamePipeline = function() {
      var original = angular.fromJson($scope.viewState.original);
      original.name = $scope.pipeline.name;
      $uibModal.open({
        templateUrl: require('./actions/rename/renamePipelineModal.html'),
        controller: 'RenamePipelineModalCtrl',
        controllerAs: 'renamePipelineModalCtrl',
        resolve: {
          pipeline: function() { return original; },
          application: function() { return $scope.application; }
        }
      }).result.then(function() {
          $scope.pipeline.name = original.name;
          $scope.viewState.original = angular.toJson(original);
        });
    };

    this.editPipelineJson = function() {
      $uibModal.open({
        templateUrl: require('./actions/json/editPipelineJsonModal.html'),
        controller: 'EditPipelineJsonModalCtrl',
        controllerAs: 'editPipelineJsonModalCtrl',
        resolve: {
          pipeline: function() { return $scope.pipeline; },
        }
      }).result.then(function() {
          $scope.$broadcast('pipeline-json-edited');
        });
    };

    this.navigateToStage = function(index, event) {
      if (index < 0 || !$scope.pipeline.stages || $scope.pipeline.stages.length <= index) {
        $scope.viewState.section = 'triggers';
        return;
      }
      $scope.viewState.section = 'stage';
      $scope.viewState.stageIndex = index;
      if (event && event.target && event.target.focus) {
        event.target.focus();
      }
    };

    this.navigateTo = function(section, index) {
      $scope.viewState.section = section;
      if (section === 'stage') {
        ctrl.navigateToStage(index);
      }
    };

    this.isActive = function(section) {
      return $scope.viewState.section === section;
    };

    this.stageIsActive = function(index) {
      return $scope.viewState.section === 'stage' && $scope.viewState.stageIndex === index;
    };

    this.removeStage = function(stage) {
      var stageIndex = $scope.pipeline.stages.indexOf(stage);
      $scope.pipeline.stages.splice(stageIndex, 1);
      $scope.pipeline.stages.forEach(function(test) {
        if (stage.refId && test.requisiteStageRefIds) {
          test.requisiteStageRefIds = _.without(test.requisiteStageRefIds, stage.refId);
        }
      });
      if (stageIndex > 0) {
        $scope.viewState.stageIndex--;
      }
      if (!$scope.pipeline.stages.length) {
        this.navigateTo('settings');
      }
    };

    this.isValid = function() {
      return _.every($scope.pipeline.stages, 'name');
    };

    this.savePipeline = function() {
      var pipeline = $scope.pipeline,
          viewState = $scope.viewState;

      $scope.viewState.saving = true;
      pipelineConfigService.savePipeline(pipeline).then(
        function() {
          viewState.original = angular.toJson(getPlain(pipeline));
          viewState.originalPipelineName = pipeline.name;
          markDirty();
          $scope.viewState.saving = false;
        },
        function() {
          $scope.viewState.saveError = true;
          $scope.viewState.saving = false;
        }
      );
    };

    this.revertPipelineChanges = function() {
      var original = angular.fromJson($scope.viewState.original);
      if (original.parallel) {
        $scope.pipeline.parallel = true;
        $scope.pipeline.stageCounter = original.stageCounter;
      } else {
        delete $scope.pipeline.parallel;
        delete $scope.pipeline.stageCounter;
      }
      $scope.pipeline.stages = original.stages;
      $scope.pipeline.triggers = original.triggers;
      $scope.pipeline.notifications = original.notifications;
      // if we were looking at a stage that no longer exists, move to the last stage
      if ($scope.viewState.section === 'stage') {
        var lastStage = $scope.pipeline.stages.length - 1;
        if ($scope.viewState.stageIndex > lastStage) {
          $scope.viewState.stageIndex = lastStage;
        }
        if (!$scope.pipeline.stages.length) {
          this.navigateTo('triggers');
        }
      }
      $scope.$broadcast('pipeline-reverted');
    };

    function cleanStageForDiffing(stage) {
      // TODO: Consider removing this altogether after migrating existing pipelines
      if (stage.cloudProviderType === 'aws') {
        delete stage.cloudProviderType;
      }
    }

    function getPlain(pipeline) {
      var base = pipeline.fromServer ? pipeline.plain() : pipeline;
      var copy = _.cloneDeep(base);
      copy.stages.forEach(cleanStageForDiffing);
      return {
        stages: copy.stages,
        triggers: copy.triggers,
        parallel: copy.parallel,
        appConfig: copy.appConfig || {},
        limitConcurrent: copy.limitConcurrent,
        stageCounter: copy.stageCounter,
        parameterConfig: copy.parameterConfig,
        notifications: copy.notifications,
      };
    }

    function pipelineUpdated(newVal, oldVal) {
      if (newVal && oldVal && newVal.name !== oldVal.name) {
        $scope.viewState.original = null;
      }
      markDirty();
    }

    var markDirty = function markDirty() {
      if (!$scope.viewState.original) {
        $scope.viewState.original = angular.toJson(getPlain($scope.pipeline));
      }
      $scope.viewState.isDirty = $scope.viewState.original !== angular.toJson(getPlain($scope.pipeline));
      if ($scope.viewState.isDirty) {
        dirtyPipelineTracker.add($scope.pipeline.name);
//        console.warn('dirty:');
//        console.warn($scope.viewState.original);
//        console.warn(angular.toJson(getPlain($scope.pipeline)));
      } else {
        dirtyPipelineTracker.remove($scope.pipeline.name);
      }
    };

    function cacheViewState() {
      var toCache = angular.copy($scope.viewState);
      delete toCache.original;
      configViewStateCache.put(buildCacheKey(), toCache);
    }

    $scope.$on('toggle-expansion', (event, expanded) => $scope.viewState.expanded = expanded);

    $scope.$watch('pipeline', pipelineUpdated, true);
    $scope.$watch('viewState.original', markDirty, true);
    $scope.$watch('viewState', cacheViewState, true);
    $scope.$watch('pipeline.name', cacheViewState);

    this.navigateTo($scope.viewState.section, $scope.viewState.stageIndex);

  });
