'use strict';

import { module } from 'angular';

import { TaskMonitor } from '@spinnaker/core';

import './upsertAutoscalingPolicy.modal.less';
import { GOOGLE_AUTOSCALINGPOLICY_AUTOSCALINGPOLICY_WRITE_SERVICE } from 'google/autoscalingPolicy/autoscalingPolicy.write.service';
import { GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_BASICSETTINGS_BASICSETTINGS_COMPONENT } from 'google/autoscalingPolicy/components/basicSettings/basicSettings.component';
import { GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_METRICSETTINGS_METRICSETTINGS_COMPONENT } from 'google/autoscalingPolicy/components/metricSettings/metricSettings.component';

export const GOOGLE_SERVERGROUP_DETAILS_AUTOSCALINGPOLICY_MODAL_UPSERTAUTOSCALINGPOLICY_MODAL_CONTROLLER =
  'spinnaker.deck.gce.upsertAutoscalingPolicy.modal.controller';
export const name = GOOGLE_SERVERGROUP_DETAILS_AUTOSCALINGPOLICY_MODAL_UPSERTAUTOSCALINGPOLICY_MODAL_CONTROLLER; // for backwards compatibility
module(GOOGLE_SERVERGROUP_DETAILS_AUTOSCALINGPOLICY_MODAL_UPSERTAUTOSCALINGPOLICY_MODAL_CONTROLLER, [
  GOOGLE_AUTOSCALINGPOLICY_AUTOSCALINGPOLICY_WRITE_SERVICE,
  GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_BASICSETTINGS_BASICSETTINGS_COMPONENT,
  GOOGLE_AUTOSCALINGPOLICY_COMPONENTS_METRICSETTINGS_METRICSETTINGS_COMPONENT,
]).controller('gceUpsertAutoscalingPolicyModalCtrl', [
  'policy',
  'application',
  'serverGroup',
  '$uibModalInstance',
  'gceAutoscalingPolicyWriter',
  '$scope',
  function (policy, application, serverGroup, $uibModalInstance, gceAutoscalingPolicyWriter, $scope) {
    [this.action, this.isNew] = policy ? ['Edit', false] : ['New', true];
    this.policy = _.cloneDeep(policy || {});

    this.cancel = $uibModalInstance.dismiss;

    this.taskMonitor = new TaskMonitor({
      application: application,
      title: `${this.action} scaling policy for ${serverGroup.name}`,
      modalInstance: $uibModalInstance,
    });

    this.save = () => {
      const submitMethod = () =>
        gceAutoscalingPolicyWriter.upsertAutoscalingPolicy(application, serverGroup, this.policy);

      this.taskMonitor.submit(submitMethod);
    };

    this.updatePolicy = (updatedPolicy) => {
      $scope.$applyAsync(() => {
        this.policy = updatedPolicy;
      });
    };
  },
]);
