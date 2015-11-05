'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.insight.directive', [])
  .directive('insightMenu', function () {
    return {
      templateUrl: require('./insightmenu.directive.html'),
      restrict: 'E',
      replace: true,
      scope: {
        actions: '=',
        title: '@',
        icon: '@',
        rightAlign: '&',
      },
    };
  });
