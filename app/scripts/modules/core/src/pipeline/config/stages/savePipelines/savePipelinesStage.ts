import {
  ArtifactReferenceService,
  ExecutionArtifactTab,
  ExecutionDetailsTasks,
  ExpectedArtifactService,
  Registry,
  SETTINGS,
} from '@spinnaker/core';
import { SavePipelinesStageConfig } from 'core/pipeline/config/stages/savePipelines/SavePipelinesStageConfig';
import { SavePipelinesResultsTab } from 'core/pipeline/config/stages/savePipelines/SavePipelinesResultsTab';

if (SETTINGS.feature.savePipelinesStageEnabled) {
  Registry.pipeline.registerStage({
    label: 'Save Pipelines',
    description: 'Saves pipelines defined in an artifact.',
    key: 'savePipelinesFromArtifact',
    component: SavePipelinesStageConfig,
    executionDetailsSections: [ExecutionDetailsTasks, ExecutionArtifactTab, SavePipelinesResultsTab],
    defaultTimeoutMs: 30 * 60 * 1000, // 30 minutes
    artifactExtractor: ExpectedArtifactService.accumulateArtifacts(['pipelinesArtifactId', 'requiredArtifactIds']),
    artifactRemover: ArtifactReferenceService.removeArtifactFromFields(['pipelinesArtifactId', 'requiredArtifactIds']),
  });
}
