'use strict';

const angular = require('angular');

import { CONFIRMATION_MODAL_SERVICE } from '@spinnaker/core';

import { SCALING_POLICY_POPOVER } from './popover/scalingPolicyPopover.component';
import { ScalingPolicyWriter } from './ScalingPolicyWriter';

import './scalingPolicySummary.component.less';

module.exports = angular
  .module('spinnaker.tencent.serverGroup.details.scalingPolicy.alarmBasedSummary.component', [
    require('./upsert/upsertScalingPolicy.controller').name,
    SCALING_POLICY_POPOVER,
    CONFIRMATION_MODAL_SERVICE,
  ])
  .component('tencentAlarmBasedSummary', {
    bindings: {
      policy: '=',
      serverGroup: '=',
      application: '=',
    },
    templateUrl: require('./alarmBasedSummary.component.html'),
    controller: [
      '$uibModal',
      'confirmationModalService',
      function($uibModal, confirmationModalService) {
        this.popoverTemplate = require('./popover/scalingPolicyDetails.popover.html');

        this.editPolicy = () => {
          $uibModal.open({
            templateUrl: require('./upsert/upsertScalingPolicy.modal.html'),
            controller: 'tencentUpsertScalingPolicyCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            resolve: {
              policy: () => this.policy,
              serverGroup: () => this.serverGroup,
              application: () => this.application,
            },
          });
        };

        this.deletePolicy = () => {
          var taskMonitor = {
            application: this.application,
            title: 'Deleting scaling policy ' + this.policy.policyName,
            onTaskComplete: () => this.application.serverGroups.refresh(),
          };

          var submitMethod = () =>
            ScalingPolicyWriter.deleteScalingPolicy(this.application, this.serverGroup, this.policy);

          confirmationModalService.confirm({
            header: 'Really delete ' + this.policy.scalingPolicyName + '?',
            buttonText: 'Delete scaling policy',
            account: this.serverGroup.account, // don't confirm if it's a junk policy
            provider: 'tencent',
            taskMonitorConfig: taskMonitor,
            submitMethod: submitMethod,
          });
        };
      },
    ],
  });
