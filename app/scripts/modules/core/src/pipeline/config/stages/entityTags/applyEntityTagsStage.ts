import { Registry } from 'core/registry';

import { ApplyEntityTagsExecutionDetails } from './ApplyEntityTagsExecutionDetails';
import { ApplyEntityTagsStageConfig } from './ApplyEntityTagsStageConfig';
import { ExecutionDetailsTasks } from '../common';

Registry.pipeline.registerStage({
  label: 'Entity Tags',
  description: 'Applies entity tags to a resource.',
  key: 'upsertEntityTags',
  defaults: {
    tags: [],
  },
  component: ApplyEntityTagsStageConfig,
  executionDetailsSections: [ApplyEntityTagsExecutionDetails, ExecutionDetailsTasks],
  strategy: true,
  validators: [{ type: 'requiredField', fieldName: 'entityRef.entityType' }],
});
