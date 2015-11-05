'use strict';

let angular = require('angular');

require('./executions.less');

module.exports = angular
  .module('spinnaker.core.delivery.main.executions.directive', [
    require('../filter/index.js'),
    require('../executionGroup/index.js'),
    require('./executions.controller.js'),
  ])
  .directive('executions', function () {
    return {
      restrict: 'E',
      templateUrl: require('./executions.html'),
      controller: 'ExecutionsCtrl',
      controllerAs: 'vm',
    };
  });
