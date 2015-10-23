'use strict';
let angular = require('angular');

module.exports = angular.module('spinnaker.core.delivery.executionGroupHeading.directive', [
  require('./triggers/triggersTag.directive.js'),
])
  .directive('executionGroupHeading', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        value: '=',
        scale: '=',
        filter: '=',
        executions: '=',
        configurations: '=',
        application: '=',
      },
      templateUrl: require('./executionGroupHeading.html'),
      controller: 'executionGroupHeading as ctrl',
    };
  });
