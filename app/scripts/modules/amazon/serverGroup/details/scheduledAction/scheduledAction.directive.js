'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.aws.instance.details.scheduledAction.directive', [
])
  .directive('scheduledAction', function(InsightFilterStateModel) {
    return {
      restrict: 'E',
      scope: {
        action: '='
      },
      templateUrl: require('./scheduledAction.directive.html'),
      link: function(scope) {
        scope.InsightFilterStateModel = InsightFilterStateModel;
      }
    };
  }).name;
