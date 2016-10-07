'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.pipeline.stage.acaTask.transformer', [
  require('core/orchestratedItem/orchestratedItem.transformer.js'),
])
  .service('acaTaskTransformer', function($log, orchestratedItemTransformer) {

    function getException (stage) {
      orchestratedItemTransformer.defineProperties(stage);
      return stage && stage.isFailed ? stage.failureMessage : null;
    }


    this.transform = function(application, execution) {
      execution.stages.forEach(function(stage) {
        if (stage.type === 'acaTask') {
          orchestratedItemTransformer.defineProperties(stage);
          stage.exceptions = [];


          if (getException(stage)) {
            stage.exceptions.push('Canary failure: ' + getException(stage));
          }

          stage.exceptions = _.uniq(stage.exceptions);

          var status = stage.status === 'CANCELED' ? 'CANCELED' : 'UNKNOWN';

          var canaryStatus = stage.context.canary.status;
          if (canaryStatus && status !== 'CANCELED') {
            if (canaryStatus.status === 'LAUNCHED' || canaryStatus.status === 'RUNNING') {
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

        }
      });
    };
  });
