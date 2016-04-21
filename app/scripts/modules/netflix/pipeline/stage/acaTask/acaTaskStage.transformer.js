'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.pipeline.stage.acaTask.transformer', [
  require('../../../../core/utils/lodash.js'),
  require('../../../../core/orchestratedItem/orchestratedItem.transformer.js'),
])
  .service('acaTaskTransformer', function($log, _, orchestratedItemTransformer) {

    function getException (stage) {
      orchestratedItemTransformer.defineProperties(stage);
      return stage && stage.isFailed ? stage.failureMessage : null;
    }


    this.transform = function(application, execution) {
      execution.stages.forEach(function(stage) {
        if (stage.type === 'acaTask') {
          orchestratedItemTransformer.defineProperties(stage);
          stage.exceptions = [];

          var monitorStage = _.find(execution.stages, {
            type: 'monitorAcaTask',
            context: {
              canaryStageId: stage.id,
            }
          });


          if (getException(monitorStage)) {
            stage.exceptions.push('Monitor Canary failure: ' + getException(monitorStage));
          }

          stage.exceptions = _.uniq(stage.exceptions);

          stage.context.canary = (monitorStage && monitorStage.context.canary) || stage.context.canary;

          var status = monitorStage && monitorStage.status === 'CANCELED' ? 'CANCELED' : 'UNKNOWN';

          var canaryStatus = stage.context.canary.status;
          if (canaryStatus && status !== 'CANCELED') {
            if (canaryStatus.status === 'LAUNCHED' || monitorStage.status === 'RUNNING') {
              status = 'RUNNING';
            }
            if (canaryStatus.complete) {
              status = 'SUCCEEDED';
            }
            if (canaryStatus.status === 'DISABLED') {
              status = 'DISABLED';
            }
            if (canaryStatus.status === 'FAILED') {
              status = 'FAILED';
            }
            if (canaryStatus.status === 'TERMINATED') {
              status = 'TERMINATED';
            }
            canaryStatus.status = status;
          } else {
            stage.context.canary.status = { status: status };
          }
          stage.status = status;

          var tasks = [];

          if(monitorStage) {
            tasks.push({
              id: monitorStage.id,
              name: monitorStage.name,
              startTime: monitorStage.startTime,
              endTime: monitorStage.endTime,
              status: monitorStage.status,
            });
          }

          stage.tasks = tasks;
        }
      });
    };
  });
