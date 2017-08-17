'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.overrideFailure', [])
  .component('overrideFailure', {
    bindings: {
      stage: '=',
    },
    templateUrl: require('./overrideFailure.component.html'),
    controller: function ($scope) {
      this.viewState = {};

      this.failureOptionChanged = () => {
        this.stage.onFailure = this.viewState.failureOption;
      };

      this.initializeFailureOption = () => {
        this.viewState.failureOption = this.stage.onFailure || 'fail';
      };

      $scope.$watch(() => this.stage, this.initializeFailureOption);
    },
  });
