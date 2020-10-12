import { withErrorBoundary } from 'core/presentation/SpinErrorBoundary';
('use strict');

import { react2angular } from 'react2angular';
import { InstanceLoadBalancerHealth } from './InstanceLoadBalancerHealth';

import { module } from 'angular';

export const CORE_INSTANCE_LOADBALANCER_INSTANCELOADBALANCERHEALTH_DIRECTIVE =
  'spinnaker.core.instance.loadBalancer.health.directive';
export const name = CORE_INSTANCE_LOADBALANCER_INSTANCELOADBALANCERHEALTH_DIRECTIVE; // for backwards compatibility
module(CORE_INSTANCE_LOADBALANCER_INSTANCELOADBALANCERHEALTH_DIRECTIVE, []).component(
  'instanceLoadBalancerHealth',
  react2angular(withErrorBoundary(InstanceLoadBalancerHealth, 'instanceLoadBalancerHealth'), [
    'loadBalancer',
    'ipAddress',
  ]),
);
