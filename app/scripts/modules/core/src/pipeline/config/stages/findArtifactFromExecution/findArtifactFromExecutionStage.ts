import { module } from 'angular';

import { Registry } from 'core/registry';
import { SETTINGS } from 'core/config/settings';

import { ExecutionDetailsTasks } from '../core';
import { FindArtifactFromExecutionCtrl } from '../findArtifactFromExecution/findArtifactFromExecution.controller';
import { FindArtifactFromExecutionExecutionDetails } from '../findArtifactFromExecution/FindArtifactFromExecutionExecutionDetails';

export const FIND_ARTIFACT_FROM_EXECUTION_STAGE = 'spinnaker.core.pipeline.stage.findArtifactStage';

module(FIND_ARTIFACT_FROM_EXECUTION_STAGE, [])
  .config(() => {
    if (SETTINGS.feature.artifacts) {
      Registry.pipeline.registerStage({
        label: 'Find Artifact From Execution',
        description: 'Find and bind an artifact from another execution',
        key: 'findArtifactFromExecution',
        templateUrl: require('./findArtifactFromExecutionConfig.html'),
        controller: 'findArtifactFromExecutionCtrl',
        controllerAs: 'ctrl',
        executionDetailsSections: [FindArtifactFromExecutionExecutionDetails, ExecutionDetailsTasks],
        validators: [
          { type: 'requiredField', fieldName: 'pipeline', fieldLabel: 'Pipeline' },
          { type: 'requiredField', fieldName: 'application', fieldLabel: 'Application' },
        ],
      });
    }
  })
  .controller('findArtifactFromExecutionCtrl', FindArtifactFromExecutionCtrl);
