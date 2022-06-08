import { module } from 'angular';

const cloudrunLoadBalancerMessageComponent: ng.IComponentOptions = {
  bindings: { showCreateMessage: '<', columnOffset: '@', columns: '@' },
  templateUrl: require('./loadBalancerMessage.component.html'),
};

export const CLOUDRUN_LOAD_BALANCER_CREATE_MESSAGE = 'spinnaker.cloudrun.loadBalancer.createMessage.component';

module(CLOUDRUN_LOAD_BALANCER_CREATE_MESSAGE, []).component(
  'cloudrunLoadBalancerMessage',
  cloudrunLoadBalancerMessageComponent,
);
