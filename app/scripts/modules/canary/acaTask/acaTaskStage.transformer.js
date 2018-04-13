'use strict';

const angular = require('angular');
import _ from 'lodash';

import { OrchestratedItemTransformer } from '@spinnaker/core';

module.exports = angular.module('spinnaker.canary.acaTask.transformer', []).service('acaTaskTransformer', function() {
  function getException(stage) {
    return stage && stage.isFailed ? stage.failureMessage : null;
  }

  this.transform = function(application, execution) {
    execution.stages.forEach(function(stage) {
      if (stage.type === 'acaTask' && execution.hydrated) {
        OrchestratedItemTransformer.defineProperties(stage);
        stage.exceptions = [];

        if (getException(stage)) {
          stage.exceptions.push('Canary failure: ' + getException(stage));
        }

        stage.exceptions = _.uniq(stage.exceptions);

        var status = stage.status;

        var canaryStatus = stage.context.canary.status;

        var canaryResult = stage.context.canary.canaryResult && stage.context.canary.canaryResult.overallResult;

        if (canaryStatus && status !== 'CANCELED') {
          if (canaryStatus.status === 'LAUNCHED' || canaryStatus.status === 'RUNNING') {
            status = 'RUNNING';
          }
          if (canaryStatus.complete && canaryResult === 'SUCCESS') {
            status = 'SUCCEEDED';
          }
          if (canaryStatus.status === 'DISABLED') {
            status = 'DISABLED';
          }
          if (canaryStatus.status === 'FAILED' || canaryResult === 'FAILURE') {
            status = 'FAILED';
          }
          if (canaryStatus.status === 'TERMINATED') {
            status = 'TERMINATED';
          }
          canaryStatus.status = status;
        } else {
          stage.context.canary.status = { status: 'UNKNOWN' };
        }
        stage.status = status;
      }
    });
  };
});
