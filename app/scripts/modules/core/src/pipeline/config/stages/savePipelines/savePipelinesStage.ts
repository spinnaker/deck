import { module } from 'angular';

import {
  ArtifactReferenceService,
  ExecutionArtifactTab,
  ExecutionDetailsTasks,
  ExpectedArtifactService,
  Registry,
} from '@spinnaker/core';
import { SavePipelinesConfigCtrl } from 'core/pipeline/config/stages/savePipelines/savePipelinesConfig.controller';

export const SAVE_PIPELINES_STAGE = 'spinnaker.core.pipeline.stage.savePipelinesStage';

module(SAVE_PIPELINES_STAGE, [])
  .config(() => {
    Registry.pipeline.registerStage({
      label: 'Save Pipelines',
      description: 'Saves pipelines defined in an artifact.',
      key: 'savePipelines',
      templateUrl: require('./savePipelinesConfig.html'),
      controller: 'SavePipelinesConfigCtrl',
      controllerAs: 'ctrl',
      executionDetailsSections: [ExecutionDetailsTasks, ExecutionArtifactTab],
      producesArtifacts: false,
      defaultTimeoutMs: 30 * 60 * 1000, // 30 minutes
      validators: [],
      artifactExtractor: ExpectedArtifactService.accumulateArtifacts(['pipelinesArtifactId', 'requiredArtifactIds']),
      artifactRemover: ArtifactReferenceService.removeArtifactFromFields([
        'pipelinesArtifactId',
        'requiredArtifactIds',
      ]),
    });
  })
  .controller('SavePipelinesConfigCtrl', SavePipelinesConfigCtrl);
