'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.serverGroup.display.tasks.tag', [
])
  .directive('runningTasksTag', function() {
    return {
      restrict: 'E',
      scope: {
        application: '=',
        tasks: '=',
        executions: '='
      },
      templateUrl: require('./runningTasksTag.html'),
      controller: 'RunningTaskTagController',
    };
  })
  .controller('RunningTaskTagController', function ($scope, runningExecutionsService) {
    $scope.popover = { show : false };
    $scope.runningExecutions = function() {
      return runningExecutionsService.filterRunningExecutions($scope.executions);
    };

  });
