import { module } from 'angular';

import {
  PIPELINE_CONFIG_PROVIDER,
  PipelineConfigProvider,
  ArtifactReferenceServiceProvider,
  SETTINGS,
} from '@spinnaker/core';

import { KubernetesV2DeployManifestConfigCtrl } from './deployManifestConfig.controller';
import { KUBERNETES_MANIFEST_COMMAND_BUILDER } from '../../../manifest/manifestCommandBuilder.service';
import { KUBERNETES_DEPLOY_MANIFEST_DEPLOY_STATUS_MANIFEST_SUMMARY } from './deployStatusManifestSummary';
import { KUBERNETES_EXECUTION_ARTIFACT_TAB } from './artifactTab';

export const KUBERNETES_DEPLOY_MANIFEST_STAGE = 'spinnaker.kubernetes.v2.pipeline.stage.deployManifestStage';

module(KUBERNETES_DEPLOY_MANIFEST_STAGE, [
  PIPELINE_CONFIG_PROVIDER,
  KUBERNETES_MANIFEST_COMMAND_BUILDER,
  KUBERNETES_DEPLOY_MANIFEST_DEPLOY_STATUS_MANIFEST_SUMMARY,
  KUBERNETES_EXECUTION_ARTIFACT_TAB,
])
  .config(
    (
      pipelineConfigProvider: PipelineConfigProvider,
      artifactReferenceServiceProvider: ArtifactReferenceServiceProvider,
    ) => {
      // Todo: replace feature flag with proper versioned provider mechanism once available.
      if (SETTINGS.feature.versionedProviders) {
        pipelineConfigProvider.registerStage({
          label: 'Deploy (Manifest)',
          description: 'Deploy a Kubernetes manifest yaml/json file.',
          key: 'deployManifest',
          cloudProvider: 'kubernetes',
          templateUrl: require('./deployManifestConfig.html'),
          controller: 'KubernetesV2DeployManifestConfigCtrl',
          controllerAs: 'ctrl',
          executionDetailsUrl: require('./deployManifestExecutionDetails.html'),
          executionConfigSections: ['deployStatus', 'taskStatus', 'artifactStatus'],
          producesArtifacts: true,
          defaultTimeoutMs: 30 * 60 * 1000, // 30 minutes
          validators: [],
        });

        artifactReferenceServiceProvider.registerReference('stage', () => [
          ['manifestArtifactId'],
          ['requiredArtifactIds'],
        ]);
      }
    },
  )
  .controller('KubernetesV2DeployManifestConfigCtrl', KubernetesV2DeployManifestConfigCtrl);
