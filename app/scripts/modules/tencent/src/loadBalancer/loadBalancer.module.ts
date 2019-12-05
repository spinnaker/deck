import { module } from 'angular';

import { TENCENT_LOAD_BALANCER_DETAILS_CTRL } from './details/loadBalancerDetails.controller';
import { TENCENT_LOAD_BALANCER_TRANSFORMER } from './loadBalancer.transformer';
import { TENCENT_TARGET_GROUP_DETAILS_CTRL } from './details/targetGroupDetails.controller';
import { LOAD_BALANCER_ACTIONS } from './details/loadBalancerActions.component';
import { TARGET_GROUP_STATES } from './targetGroup.states';

export const TENCENT_LOAD_BALANCER_MODULE = 'spinnaker.tencent.loadBalancer';

module(TENCENT_LOAD_BALANCER_MODULE, [
  TENCENT_LOAD_BALANCER_DETAILS_CTRL,
  TENCENT_LOAD_BALANCER_TRANSFORMER,
  TENCENT_TARGET_GROUP_DETAILS_CTRL,
  LOAD_BALANCER_ACTIONS,
  TARGET_GROUP_STATES,
]);
