import { module } from 'angular';

export const CAPACITY_SELECTOR = 'spinnaker.amazon.serverGroup.configure.wizard.capacity.selector';
module(CAPACITY_SELECTOR, [])
  .component('awsServerGroupCapacitySelector', {
    bindings: {
      command: '=',
    },
    templateUrl: require('./capacitySelector.component.html'),
    controller: function () {
      this.minMaxDesiredTemplate = require('./minMaxDesiredFields.template.html');

      this.preferSourceCapacityOptions = [
        { label: 'fail the stage', value: undefined },
        { label: 'use fallback values', value: true },
      ];

      this.useSourceCapacityUpdated = () => {
        if (!this.command.useSourceCapacity) {
          delete this.command.preferSourceCapacity;
        }
      };

      this.setSimpleCapacity = (simpleCapacity: boolean) => {
        this.command.viewState.useSimpleCapacity = simpleCapacity;
        this.command.useSourceCapacity = false;
        this.setMinMax(this.command.capacity.desired);
      };

      this.setMinMax = (newVal: number) => {
        if (this.command.viewState.useSimpleCapacity) {
          this.command.capacity.min = newVal;
          this.command.capacity.max = newVal;
          this.command.useSourceCapacity = false;
        }
      };
    }
  });
