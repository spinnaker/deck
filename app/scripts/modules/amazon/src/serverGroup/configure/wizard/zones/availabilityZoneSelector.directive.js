'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.amazon.serverGroups.configure.wizard.zoneSelector.directive', [
])
  .directive('availabilityZoneSelector', function() {
    return {
      restrict: 'E',
      scope: {
        command: '=',
      },
      templateUrl: require('./availabilityZoneSelector.directive.html'),
      controller: function($scope) {
        $scope.autoBalancingOptions = [
          { label: 'Enabled', value: true},
          { label: 'Manual', value: false}
        ];
      },
    };
});
