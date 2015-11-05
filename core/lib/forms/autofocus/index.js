'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.forms.autofocus', [])
  .directive('autofocus', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        $timeout(function() { elem.focus(); });
      }
    };
});
