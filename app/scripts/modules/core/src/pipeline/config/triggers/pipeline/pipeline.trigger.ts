'use strict';

import { ArtifactTypePatterns } from 'core/artifact';
import { Registry } from 'core/registry';

import { PipelineTrigger } from './PipelineTrigger';
import { PipelineTriggerTemplate } from './PipelineTriggerTemplate';
import { ExecutionUserStatus } from '../../../status/ExecutionUserStatus';

Registry.pipeline.registerTrigger({
  component: PipelineTrigger,
  description: 'Listens to a pipeline execution',
  label: 'Pipeline',
  key: 'pipeline',
  excludedArtifactTypePatterns: [ArtifactTypePatterns.JENKINS_FILE],
  executionStatusComponent: ExecutionUserStatus,
  manualExecutionComponent: PipelineTriggerTemplate,
  executionTriggerLabel: () => 'Pipeline',
});
