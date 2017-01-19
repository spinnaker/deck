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
        yet, create an map to hold them in. */
    if ($scope.trigger.constraints == null) {
      $scope.trigger.constraints = {};
      /* TODO: Find a way to add actual application and pipeline names into the constraints */
      $scope.trigger.constraints['application'] = 'Application placeholder: FIX ME!';
      $scope.trigger.constraints['pipeline'] = 'Pipeline Name placeholder: FIX ME!';
    }

    function updateExamplePayload () {
      $scope.examplePayload = {};
      angular.forEach($scope.trigger.constraints, function(value, key) {
        if (key != '') {
          $scope.examplePayload[key] = value;
        }
      });
    }

    updateExamplePayload();

    $scope.$watchCollection('trigger.constraints', function() { updateExamplePayload(); });


  });
