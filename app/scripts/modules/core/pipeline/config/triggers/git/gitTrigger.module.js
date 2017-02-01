'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.trigger.git', [
    require('core/config/settings.js'),
  ])
  .config(function (pipelineConfigProvider) {
    pipelineConfigProvider.registerTrigger({
      label: 'Git',
      description: 'Executes the pipeline on a git push',
      key: 'git',
      controller: 'GitTriggerCtrl',
      controllerAs: 'vm',
      templateUrl: require('./gitTrigger.html'),
      popoverLabelUrl: require('./gitPopoverLabel.html'),
    });
  })
  .controller('GitTriggerCtrl', function (trigger, $scope, settings) {
    this.trigger = trigger;
    this.fiatEnabled = settings.feature.fiatEnabled;

    $scope.gitTriggerTypes = ['stash', 'github'];

    if (settings && settings.gitSources) {
      $scope.gitTriggerTypes = settings.gitSources;
    }

    if ($scope.gitTriggerTypes.length == 1) {
      trigger.source = $scope.gitTriggerTypes[0];
    }

    function updateBranch() {
      if (_.trim(trigger.branch) === '') {
        trigger.branch = null;
      }
    }

    $scope.$watch('trigger.branch', updateBranch);
  });
