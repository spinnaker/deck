import { module } from 'angular';

import './stepPolicyAction.component.less';

const stepPolicyActionComponent = {
  bindings: {
    command: '<',
    viewState: '=',
    boundsChanged: '&',
  },
  templateUrl: require('./stepPolicyAction.component.html'),
  controller() {
    this.operatorChanged = () => {
      this.command.adjustmentType = this.viewState.operator === 'Set to' ? 'EXACT_CAPACITY' : 'CHANGE_IN_CAPACITY';
      this.adjustmentTypeOptions =
        this.viewState.operator === 'Set to' ? ['instances'] : ['instances', 'percent of group'];
    };

    this.availableActions = ['Add', 'Remove', 'Set to'];

    this.adjustmentTypeChanged = () => {
      if (this.viewState.adjustmentType === 'instances') {
        this.command.adjustmentType = this.viewState.operator === 'Set to' ? 'EXACT_CAPACITY' : 'CHANGE_IN_CAPACITY';
      } else {
        this.command.adjustmentType = 'PERCENT_CHANGE_IN_CAPACITY';
      }
    };

    this.addStep = () => {
      this.command.step.stepAdjustments.push({ adjustmentValue: 1 });
    };

    this.removeStep = (index: number) => {
      this.command.step.stepAdjustments.splice(index, 1);
      this.boundsChanged();
    };

    this.$onInit = () => {
      this.operatorChanged();
      this.adjustmentTypeChanged();
    };
  },
};

export const STEP_POLICY_ACTION = 'spinnaker.tencent.scalingPolicy.stepPolicy.action';
module(STEP_POLICY_ACTION, []).component('tencentStepPolicyAction', stepPolicyActionComponent);
