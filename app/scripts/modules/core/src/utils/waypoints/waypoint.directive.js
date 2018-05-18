'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.utils.waypoints.directive', []).directive('waypoint', function() {
  return {
    restrict: 'A',
    link: {
      post: function(scope, elem) {
        scope.$on('$destroy', function() {
          elem.removeData();
        });
      },
    },
  };
});
