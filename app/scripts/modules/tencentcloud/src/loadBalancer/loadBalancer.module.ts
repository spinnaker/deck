import { module } from 'angular';

import { TENCENTCLOUD_LOAD_BALANCER_TRANSFORMER } from './loadBalancer.transformer';
import { LOAD_BALANCER_ACTIONS } from './details/loadBalancerActions.component';
import { TARGET_GROUP_STATES } from './targetGroup.states';

export const TENCENTCLOUD_LOAD_BALANCER_MODULE = 'spinnaker.tencentcloud.loadBalancer';

module(TENCENTCLOUD_LOAD_BALANCER_MODULE, [
  TENCENTCLOUD_LOAD_BALANCER_TRANSFORMER,
  LOAD_BALANCER_ACTIONS,
  TARGET_GROUP_STATES,
]);
