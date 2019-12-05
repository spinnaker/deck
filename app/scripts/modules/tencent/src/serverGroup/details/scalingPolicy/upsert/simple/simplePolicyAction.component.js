'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.tencent.serverGroup.details.scalingPolicy.upsert.actions.simplePolicy', [])
  .component('tencentSimplePolicyAction', {
    bindings: {
      command: '<',
      viewState: '=',
    },
    templateUrl: require('./simplePolicyAction.component.html'),
    controller: function() {
      this.operatorChanged = () => {
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

      this.$onInit = () => {
        this.operatorChanged();
        this.adjustmentTypeChanged();
      };
    },
  });
