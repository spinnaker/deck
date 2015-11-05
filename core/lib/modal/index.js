'use strict';

let angular = require('angular');

require('./modals.less');

module.exports = angular
  .module('spinnaker.core.modal', [
    require('./modalOverlay.directive.js'),
    require('./modalPage.directive.js'),
    require('./buttons'),
    require('./wizard'),
    require('./closeable'),
  ]).run(function($rootScope, $uibModalStack) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if (!fromParams.allowModalToStayOpen) {
        $uibModalStack.dismissAll();
      }
    });
  });
