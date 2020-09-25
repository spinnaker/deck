import { ExecutionArtifactTab, ExecutionDetailsTasks, Registry } from '@spinnaker/core';

import {
  validateDeployAppengineConfigurationStage,
  DeployAppengineConfigurationConfig,
} from './DeployAppengineConfigurationConfig';

export const DEPLOY_APPENGINE_CONFIG_STAGE_KEY = 'deployAppEngineConfiguration';

Registry.pipeline.registerStage({
  label: 'Deploy AppEngine Configuration',
  description: 'Deploy index, dispatch, cron, and queue configuration to AppEngine.',
  key: DEPLOY_APPENGINE_CONFIG_STAGE_KEY,
  component: DeployAppengineConfigurationConfig,
  producesArtifacts: false,
  cloudProvider: 'appengine',
  executionDetailsSections: [ExecutionDetailsTasks, ExecutionArtifactTab],
  validateFn: validateDeployAppengineConfigurationStage,
});
