'use strict';

import { module } from 'angular';

import { CONFIRMATION_MODAL_SERVICE } from '@spinnaker/core';

import { SCALING_POLICY_POPOVER } from './popover/scalingPolicyPopover.component';
import { ScalingPolicyWriter } from './ScalingPolicyWriter';

import './scalingPolicySummary.component.less';
import { AMAZON_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_UPSERTSCALINGPOLICY_CONTROLLER } from './upsert/upsertScalingPolicy.controller';

export const AMAZON_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT =
  'spinnaker.amazon.serverGroup.details.scalingPolicy.alarmBasedSummary.component';
export const name = AMAZON_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT; // for backwards compatibility
module(AMAZON_SERVERGROUP_DETAILS_SCALINGPOLICY_ALARMBASEDSUMMARY_COMPONENT, [
  AMAZON_SERVERGROUP_DETAILS_SCALINGPOLICY_UPSERT_UPSERTSCALINGPOLICY_CONTROLLER,
  SCALING_POLICY_POPOVER,
  CONFIRMATION_MODAL_SERVICE,
]).component('alarmBasedSummary', {
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
          controller: 'awsUpsertScalingPolicyCtrl',
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
        const taskMonitor = {
          application: this.application,
          title: 'Deleting scaling policy ' + this.policy.policyName,
        };

        const submitMethod = () =>
          ScalingPolicyWriter.deleteScalingPolicy(this.application, this.serverGroup, this.policy);

        confirmationModalService.confirm({
          header: 'Really delete ' + this.policy.policyName + '?',
          buttonText: 'Delete scaling policy',
          account: this.policy.alarms.length ? this.serverGroup.account : null, // don't confirm if it's a junk policy
          provider: 'aws',
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };
    },
  ],
});
