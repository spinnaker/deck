import { module } from 'angular';
import { react2angular } from 'react2angular';
import { ExecutionArtifactTab } from './react/ExecutionArtifactTab';

export const EXECUTION_ARTIFACT_TAB = 'spinnaker.core.artifact.artifactTab.component';

module(EXECUTION_ARTIFACT_TAB, []).component(
  'executionArtifactTab',
  react2angular(ExecutionArtifactTab, ['config', 'stage', 'execution']),
);
