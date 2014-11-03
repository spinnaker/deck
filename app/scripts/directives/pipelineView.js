'use strict';


angular.module('deckApp')
  .directive('pipelineView', function () {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'views/directives/pipeline.html',
      controller: function ($scope) {
        var DEFAULT_PIPELINE_COUNT = 4;

        $scope.executionCount = $scope.pipeline.executions.length;

        $scope.getStyleForExecution = function(execution) {
          return {
            width: Math.floor((1 / execution.stages.length) * 100) + '%'
          };
        };

        $scope.getMoreExecutions = function() {
          $scope.$parent.lastVisibleExecutionIdx = $scope.$parent.lastVisibleExecutionIdx + DEFAULT_PIPELINE_COUNT;
          loadExecutions();
        };

        function loadExecutions() {
          if (!$scope.visibleExecutions) {
            $scope.visibleExecutions = [];
          }
          var endIdx = $scope.$parent.lastVisibleExecutionIdx + DEFAULT_PIPELINE_COUNT;
          $scope.visibleExecutions = $scope.pipeline.executions.slice(0, endIdx);
        }

        loadExecutions();
      }
    };
  }
);
