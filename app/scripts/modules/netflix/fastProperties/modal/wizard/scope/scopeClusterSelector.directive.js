'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.fastProperties.scope.clusterSelector.directive', [])
  .directive('scopeClusterSelector', function() {
    return {
      restrict: 'E',
      scope: {
        allowNone: '=?'
      },
      bindToController: {
        model: '=',
        clusters: '=?',
        showIf: '=',
        onChange: '&',
        getClusters: '&?'

      },
      controllerAs: 'fp',
      controller: function controller($scope) {
        var vm = this;
        vm.freeFormClusterField = false;

        vm.allowNone = _.isBoolean($scope.allowNone) ? $scope.allowNone : true;

        vm.clusterChanged = () => {
          vm.onChange({cluster: vm.model});
        };

        vm.toggleFreeFormClusterField = function() {
          vm.freeFormClusterField = !vm.freeFormClusterField;
        };

        vm.getClusterList = () => {
          return vm.getClusters();
        };

      },
      templateUrl: require('./scopeClusterSelector.directive.html')
    };
  });
