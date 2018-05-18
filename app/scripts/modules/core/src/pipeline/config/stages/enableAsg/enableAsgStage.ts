import { module } from 'angular';

import { Registry } from 'core/registry';
import { EnableAsgExecutionDetails } from './EnableAsgExecutionDetails';
import { ExecutionDetailsTasks } from '../core';

export const ENABLE_ASG_STAGE = 'spinnaker.core.pipeline.stage.enableAsg';

module(ENABLE_ASG_STAGE, []).config(() => {
  Registry.pipeline.registerStage({
    useBaseProvider: true,
    executionDetailsSections: [EnableAsgExecutionDetails, ExecutionDetailsTasks],
    key: 'enableServerGroup',
    label: 'Enable Server Group',
    description: 'Enables a server group',
    strategy: true,
  });
});
