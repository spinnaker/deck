'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.trigger.webhook', [
    require('../../../../../core/config/settings.js'),
  ])
  .config(function (pipelineConfigProvider) {
    pipelineConfigProvider.registerTrigger({
      label: 'Webhook',
      description: 'Executes the pipeline on a Webhook POST',
      key: 'webhook',
      controller: 'WebhookTriggerCtrl as ctrl',
      controllerAs: 'vm',
      templateUrl: require('./webhookTrigger.html'),
      popoverLabelUrl: require('./webhookPopoverLabel.html'),
    });
  })
  .controller('WebhookTriggerCtrl', function (trigger, $scope, settings) {
    $scope.viewState = {
      exampleLoaded: false,
    };

    this.trigger = trigger;

    this.trigger.extras = { "test": "this is a test"};

//    if (settings && settings.type) {
//      $scope.type = settings.type;
//    }
//
//    if (settings && settings.source) {
//      $scope.source = settings.source;
//    }

//    if ($scope.gitTriggerTypes.length == 1) {
//      trigger.source = $scope.gitTriggerTypes[0];
//    }

    function checkAndDisplayExamplePayload() {

      //$scope.viewState.exampleLoaded = true;
    }

    $scope.$watch('vm.trigger.source', checkAndDisplayExamplePayload);

  });
