'use strict';

const angular = require('angular');

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
  .controller('RunningTaskTagController', function ($scope) {
    $scope.popover = { show : false };
    $scope.runningExecutions = function() {
      return ($scope.executions || []).filter(e => e.isRunning || e.hasNotStarted);
    };

  });
