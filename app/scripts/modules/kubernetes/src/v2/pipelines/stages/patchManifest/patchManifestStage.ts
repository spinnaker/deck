import { module } from 'angular';

import {
  ArtifactReferenceService,
  ExecutionArtifactTab,
  ExecutionDetailsTasks,
  Registry,
  SETTINGS,
} from '@spinnaker/core';
import { KubernetesV2PatchManifestConfigCtrl } from '../patchManifest/patchManifestConfig.controller';
import { KUBERNETES_PATCH_MANIFEST_OPTIONS_FORM } from '../../../manifest/patch/patchOptionsForm.component';
import { KUBERNETES_MANIFEST_SELECTOR } from '../../../manifest/selector/selector.component';
import { DeployStatus } from '../deployManifest/react/DeployStatus';
import { IPipeline, IStage } from '../../../../../../core/src/domain';
import { ICustomValidator } from '../../../../../../core/src/pipeline/config/validation/PipelineConfigValidator';

export const KUBERNETES_PATCH_MANIFEST_STAGE = 'spinnaker.kubernetes.v2.pipeline.stage.patchManifestStage';

export class PatchStatus extends DeployStatus {
  public static title = 'PatchStatus';
}

module(KUBERNETES_PATCH_MANIFEST_STAGE, [KUBERNETES_PATCH_MANIFEST_OPTIONS_FORM, KUBERNETES_MANIFEST_SELECTOR])
  .config(() => {
    if (SETTINGS.feature.versionedProviders) {
      Registry.pipeline.registerStage({
        label: 'Patch (Manifest)',
        description: 'Patch a kubernetes object in place.',
        key: 'patchManifest',
        cloudProvider: 'kubernetes',
        templateUrl: require('./patchManifestConfig.html'),
        controller: 'KubernetesV2PatchManifestConfigCtrl',
        controllerAs: 'ctrl',
        artifactFields: ['manifestArtifactId', 'requiredArtifactIds'],
        executionDetailsSections: [PatchStatus, ExecutionDetailsTasks, ExecutionArtifactTab],
        producesArtifacts: true,
        defaultTimeoutMs: 30 * 60 * 1000, // 30 minutes
        validators: [
          { type: 'requiredField', fieldName: 'location', fieldLabel: 'Namespace' },
          { type: 'requiredField', fieldName: 'account', fieldLabel: 'Account' },
          { type: 'requiredField', fieldName: 'kind', fieldLabel: 'Kind' },
          {
            type: 'custom',
            fieldLabel: 'Name',
            validate: (_pipeline: IPipeline, stage: IStage) => {
              let result = null;
              if (stage.manifestName) {
                const split = stage.manifestName.split(' ');
                if (split.length < 2 || split[1] === '' || split[1] === 'undefined') {
                  result = `<strong>Name</strong> is a required field for ${stage.name} stage`;
                }
              }
              return result;
            },
          } as ICustomValidator,
        ],
      });

      ArtifactReferenceService.registerReference('stage', () => [['manifestArtifactId'], ['requiredArtifactIds']]);
    }
  })
  .controller('KubernetesV2PatchManifestConfigCtrl', KubernetesV2PatchManifestConfigCtrl);
