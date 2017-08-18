'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.overrideFailure', [])
  .component('overrideFailure', {
    bindings: {
      stage: '=',
    },
    templateUrl: require('./overrideFailure.component.html'),
    controller: function ($scope) {
      this.initializeFailureOption = () => {
        this.stage.onFailure = this.stage.onFailure || 'fail';
      };

      $scope.$watch(() => this.stage, this.initializeFailureOption);
    },
  });
