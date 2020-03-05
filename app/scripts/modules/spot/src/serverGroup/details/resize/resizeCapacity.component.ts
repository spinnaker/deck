import { IComponentOptions, module } from 'angular';

const resizeCapacityComponent: IComponentOptions = {
  bindings: {
    command: '=',
    currentSize: '=',
  },
  templateUrl: require('./resizeCapacity.component.html'),
  controller: () => {},
};

export const SPOT_RESIZE_CAPACITY_COMPONENT = 'spinnaker.spot.serverGroup.resize';
module(SPOT_RESIZE_CAPACITY_COMPONENT, []).component('spotResizeCapacity', resizeCapacityComponent);
