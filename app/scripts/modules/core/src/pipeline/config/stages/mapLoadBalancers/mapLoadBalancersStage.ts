import { module } from 'angular';

import { Registry } from 'core/registry';
import { ExecutionDetailsTasks } from '../core';
import { MapLoadBalancersExecutionDetails } from './MapLoadBalancersExecutionDetails';

export const MAP_LOAD_BALANCERS_STAGE = 'spinnaker.core.pipeline.stage.mapLoadBalancers';

module(MAP_LOAD_BALANCERS_STAGE, []).config(() => {
  Registry.pipeline.registerStage({
    executionDetailsSections: [MapLoadBalancersExecutionDetails, ExecutionDetailsTasks],
    useBaseProvider: true,
    key: 'mapLoadBalancers',
    label: 'Map Load Balancers',
    description: 'Map load balancers',
    strategy: true,
  });
});
