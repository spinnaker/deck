'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.delivery.executionDetails.directive', [
])
  .directive('executionDetails', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        execution: '=',
      },
      templateUrl: require('./executionDetails.html'),
      controller: 'executionDetails as ctrl',
    };
  });
