'use strict';


angular.module('deckApp')
  .directive('pipelineStageView', function () {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/pipelineStage.html',
      scope: {
        stage: '='
      },
      controller: function ($scope) {
        $scope.getStatusClass = function() {
          switch ($scope.stage.status) {
            case 'EXECUTING':
              return 'running glow';
            default:
              return $scope.stage.status.toLowerCase();
          }
        };
        $scope.getDuration = function(step) {
          return parseInt(step.endTime) - parseInt(step.startTime);
        };
      }
    };
  }
).directive('stageDetails', function ($q, $templateCache, $compile) {
  var getTemplate = function($scope) {
    var q = $q.defer();
    var template = $templateCache.get('views/directives/pipelineStageDetails-'+$scope.stage.name+'.html');
    if (!template) {
      template = $templateCache.get('views/directives/pipelineStageDetails.html');
    }
    q.resolve(template);
    return q.promise;
  };

  return {
    restrict: 'A',
    link: function(scope, element) {
      getTemplate(scope).then(function(template) {
        var options = {
          content: $compile($(template))(scope),
          placement: 'bottom',
          html: true,
          trigger: 'hover'
        };
        $(element).popover(options);
      });
    }
  };
});
