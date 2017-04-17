'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.deck.gce.serverGroup.details.resizeAutoscalingPolicy.component', [
    require('../../../autoscalingPolicy/autoscalingPolicy.write.service.js'),
  ])
  .component('gceResizeAutoscalingPolicy', {
    bindings: {
      serverGroup: '=',
      command: '=',
      formMethods: '=',
      application: '='
    },
    templateUrl: require('./resizeAutoscalingPolicy.component.html'),
    controller: function ($scope, gceAutoscalingPolicyWriter) {
      let newPolicyBounds = ['newMinNumReplicas','newMaxNumReplicas'];
      newPolicyBounds.forEach((prop) => this.command[prop] = null);

      angular.extend(this.formMethods, {
        formIsValid: () => _.every([
          _.chain(newPolicyBounds).map(bound => this.command[bound] !== null).every().value(),
          $scope.resizeAutoscalingPolicyForm.$valid
        ]),
        submitMethod: () => {
          return gceAutoscalingPolicyWriter.upsertAutoscalingPolicy(this.application, this.serverGroup, {
            minNumReplicas: this.command.newMinNumReplicas,
            maxNumReplicas: this.command.newMaxNumReplicas
          }, {
            reason: this.command.reason,
            interestingHealthProviderNames: this.command.interestingHealthProviderNames
          });
        }
      });
    }
  });
