import { module } from 'angular';

import { Registry } from 'core/registry';

import { CreateServerGroupExecutionDetails } from './CreateServerGroupExecutionDetails';
import { ExecutionDetailsTasks } from '../common';
import { STAGE_COMMON_MODULE } from '../common/stage.common.module';
import { CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE } from '../stage.module';

export const CREATE_SERVER_GROUP_STAGE = 'spinnaker.core.pipeline.stage.createServerGroup';
module(CREATE_SERVER_GROUP_STAGE, [CORE_PIPELINE_CONFIG_STAGES_STAGE_MODULE, STAGE_COMMON_MODULE]).config(() => {
  Registry.pipeline.registerStage({
    useBaseProvider: true,
    key: 'deployElastigroup',
    label: 'Create Server Group',
    executionDetailsSections: [CreateServerGroupExecutionDetails, ExecutionDetailsTasks],
    description: 'Creates a server group',
    strategy: false,
  });
});
