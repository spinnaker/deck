'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.delivery.execution.directive', [
])
  .directive('execution', function($location) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        execution: '=',
        filter: '=',
        scale: '=',
        executions: '=',
        application: '=',
      },
      templateUrl: require('./execution.html'),
      controller: 'execution as ctrl',
      link: function(scope) {
        scope.$location = $location;
      }
    };
  });
