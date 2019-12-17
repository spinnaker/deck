'use strict';

import { module } from 'angular';

import { INSTANCE_STATES } from './instance.states';
import './instanceSearchResultType';
import './instanceSelection.less';
import { CORE_INSTANCE_DETAILS_CONSOLE_CONSOLEOUTPUTLINK_DIRECTIVE } from './details/console/consoleOutputLink.directive';
import { CORE_INSTANCE_LOADBALANCER_INSTANCELOADBALANCERHEALTH_DIRECTIVE } from './loadBalancer/instanceLoadBalancerHealth.directive';
import { CORE_INSTANCE_DETAILS_MULTIPLEINSTANCES_CONTROLLER } from './details/multipleInstances.controller';
import { CORE_INSTANCE_DETAILS_INSTANCELINKS_COMPONENT } from './details/instanceLinks.component';

export const CORE_INSTANCE_INSTANCE_MODULE = 'spinnaker.core.instance';
export const name = CORE_INSTANCE_INSTANCE_MODULE; // for backwards compatibility
module(CORE_INSTANCE_INSTANCE_MODULE, [
  CORE_INSTANCE_DETAILS_CONSOLE_CONSOLEOUTPUTLINK_DIRECTIVE,
  CORE_INSTANCE_LOADBALANCER_INSTANCELOADBALANCERHEALTH_DIRECTIVE,
  CORE_INSTANCE_DETAILS_MULTIPLEINSTANCES_CONTROLLER,
  CORE_INSTANCE_DETAILS_INSTANCELINKS_COMPONENT,
  INSTANCE_STATES,
]);
