'use strict';

const angular = require('angular');

import './infrastructureProject.directive.less';

module.exports = angular.module('spinnaker.core.search.infrastructure.project.infrastructureProject.directive', [])
  .directive('infrastructureProject', function() {
    return {
      restrict: 'E',
      templateUrl: require('./infrastructureProject.directive.html'),
      scope: {
        projectName: '=',
        applications: '=',
        canRemove: '=',
        onRemove: '&',
      }
    };
  });
