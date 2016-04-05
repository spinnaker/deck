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
  .controller('WebhookTriggerCtrl', function (trigger, $scope) {

    $scope.trigger = trigger;

    /* If this is a new trigger and constraints have not been set
        yet, create a map to hold them in and initialise it with
        application and pipeline names. */
    $scope.trigger.constraints = $scope.trigger.constraints || {
      application: $scope.application.name,
      pipeline: $scope.pipeline.name
    };

    this.updateExamplePayload = () => $scope.examplePayload = angular.copy($scope.trigger.constraints);

    this.updateExamplePayload();

  });
