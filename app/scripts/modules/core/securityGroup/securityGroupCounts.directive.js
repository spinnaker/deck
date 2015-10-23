'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.securityGroup.counts.directive', [])
  .directive('securityGroupCounts', function () {
    return {
      templateUrl: require('./securityGroupCounts.html'),
      restrict: 'E',
      scope: {
        container: '='
      },
      link: function(scope) {
        var container = scope.container;

        scope.serverGroupCount = container.serverGroups ? container.serverGroups.length : 0;
        scope.loadBalancerCount = container.loadBalancers ? container.loadBalancers.length : 0;
      }
    };
  }
);
