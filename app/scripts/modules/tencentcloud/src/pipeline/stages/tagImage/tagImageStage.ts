import { Registry, ExecutionDetailsTasks } from '@spinnaker/core';
import { TagImageConfig } from './TagImageConfig';
import { TagImageExecutionDetails } from './TagImageExecutionDetails';

Registry.pipeline.registerStage({
  provides: 'upsertImageTags',
  key: 'upsertImageTags',
  cloudProvider: 'tencentcloud',
  component: TagImageConfig,
  executionDetailsSections: [TagImageExecutionDetails, ExecutionDetailsTasks],
  executionConfigSections: ['tagImageConfig', 'taskStatus'],
});
