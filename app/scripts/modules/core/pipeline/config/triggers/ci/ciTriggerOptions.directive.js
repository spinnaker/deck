'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.pipeline.config.triggers.ci.options.directive', [
    require('core/ci/igor.service.js')
  ])
  .directive('ciTriggerOptions', function () {
    return {
      restrict: 'E',
      templateUrl: require('./ciTriggerOptions.directive.html'),
      bindToController: {
        command: '=',
      },
      controller: 'CITriggerOptionsCtrl',
      controllerAs: 'vm',
      scope: {}
    };
  })
  .controller('CITriggerOptionsCtrl', function ($scope, igorService) {
    // These fields will be added to the trigger when the form is submitted
    this.command.extraFields = {};

    this.viewState = {
      buildsLoading: true,
      loadError: false,
      selectedBuild: null,
    };

    let buildLoadSuccess = (builds) => {
      this.builds = builds.filter((build) => !build.building && build.result === 'SUCCESS')
        .sort((a, b) => b.number - a.number);
      if (this.builds.length) {
        let defaultSelection = this.builds[0];
        this.viewState.selectedBuild = defaultSelection;
        this.updateSelectedBuild(defaultSelection);
      }
      this.viewState.buildsLoading = false;
    };

    let buildLoadFailure = () => {
      this.viewState.buildsLoading = false;
      this.viewState.loadError = true;
    };

    let initialize = () => {
      let command = this.command;
      // do not re-initialize if the trigger has changed to some other type
      if (command.trigger.type !== 'ci') {
        return;
      }
      this.viewState.buildsLoading = true;
      igorService.listBuildsForJob(command.trigger.master, command.trigger.job)
        .then(buildLoadSuccess, buildLoadFailure);
    };

    this.updateSelectedBuild = (item) => {
      this.command.extraFields.buildNumber = item.number;
    };

    $scope.$watch(() => this.command.trigger, initialize);

  });
