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

    $scope.trigger = trigger;

    /* Setting constraints as a hash works. */
    //this.trigger.constraints = { "test": "this is a test"};


    /* But pushing them into an array is upsetting echo

    2016-04-12 10:58:45.696  INFO 2412 --- [ool-11-thread-1] .s.e.s.a.p.i.PipelineConfigsPollingAgent : Running the pipeline configs polling agent...
    2016-04-12 10:58:47.334 ERROR 2412 --- [  Retrofit-Idle] c.n.s.e.pipelinetriggers.PipelineCache   : Error fetching pipelines from Front50:
        com.google.gson.JsonSyntaxException: java.lang.IllegalStateException: Expected BEGIN_ARRAY but was BEGIN_OBJECT
        at line 145 column 24 path $[1].triggers[1].constraints[0]

    */

    if (angular.isUndefined($scope.trigger.constraints)) {
      $scope.trigger.constraints = [];
    }

    this.add = function() {
      $scope.trigger.constraints.push({name:'', value: ''});

    };

  });
