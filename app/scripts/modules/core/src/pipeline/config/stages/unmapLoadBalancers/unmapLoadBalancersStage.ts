import { module } from 'angular';

import { Registry } from 'core/registry';
import { ExecutionDetailsTasks } from '../core';
import { UnmapLoadBalancersExecutionDetails } from './UnmapLoadBalancersExecutionDetails';

export const UNMAP_LOAD_BALANCERS_STAGE = 'spinnaker.core.pipeline.stage.unmapLoadBalancers';

module(UNMAP_LOAD_BALANCERS_STAGE, []).config(() => {
  Registry.pipeline.registerStage({
    executionDetailsSections: [UnmapLoadBalancersExecutionDetails, ExecutionDetailsTasks],
    useBaseProvider: true,
    key: 'unmapLoadBalancers',
    label: 'Unmap Load Balancers',
    description: 'Unmap load balancers',
    strategy: true,
  });
});
