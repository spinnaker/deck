import { IController, IScope } from 'angular';
import { defaults } from 'lodash';
import { ExpectedArtifactService } from 'core/artifact';
import { IExpectedArtifact } from '@spinnaker/core';

import {
  IKubernetesManifestCommandMetadata,
  IKubernetesManifestCommandData,
  KubernetesManifestCommandBuilder,
} from 'kubernetes/v2/manifest/manifestCommandBuilder.service';

export class KubernetesV2DeployManifestConfigCtrl implements IController {
  public state = {
    loaded: false,
  };

  public metadata: IKubernetesManifestCommandMetadata;
  public textSource = 'text';
  public artifactSource = 'artifact';
  public sources = [this.textSource, this.artifactSource];
  public workingExpectedArtifact: IExpectedArtifact = null;

  public static $inject = ['$scope'];
  constructor(private $scope: IScope) {
    KubernetesManifestCommandBuilder.buildNewManifestCommand(
      this.$scope.application,
      this.$scope.stage.manifests || this.$scope.stage.manifest,
      this.$scope.stage.moniker,
    ).then((builtCommand: IKubernetesManifestCommandData) => {
      if (this.$scope.stage.isNew) {
        defaults(this.$scope.stage, builtCommand.command, {
          manifestArtifactAccount: '',
          source: this.textSource,
        });
      }
      this.metadata = builtCommand.metadata;
      this.state.loaded = true;
    });
    $scope.artifact = {
      id: '',
      source: 'expectedArtifact',
    };
  }

  public onExpectedArtifactSelected = (artifact: any) => {
    this.$scope.$applyAsync(() => {
      this.$scope.stage.manifestArtifactId = artifact.id;
      this.$scope.artifact = { id: artifact.id, source: 'expectedArtifact' };
    });
  };

  public onArtifactEdited = (artifact: any) => {
    const { pipeline } = this.$scope.$parent;
    if (!pipeline.expectedArtifacts) {
      pipeline.expectedArtifacts = [];
    }
    if (!this.workingExpectedArtifact) {
      this.workingExpectedArtifact = ExpectedArtifactService.createEmptyArtifact();
      this.workingExpectedArtifact.matchArtifact.type = 'unmatchable/artifact';
    }
    this.workingExpectedArtifact = { ...this.workingExpectedArtifact, defaultArtifact: artifact };
    const indexOfExistingArtifactWithId = pipeline.expectedArtifacts.findIndex(
      (ea: IExpectedArtifact) => ea.id === this.workingExpectedArtifact.id,
    );
    if (indexOfExistingArtifactWithId > -1) {
      pipeline.expectedArtifacts[indexOfExistingArtifactWithId] = this.workingExpectedArtifact;
    } else {
      pipeline.expectedArtifacts.push(this.workingExpectedArtifact);
    }
    this.$scope.$applyAsync(() => {
      this.$scope.stage.manifestArtifactId = this.workingExpectedArtifact.id;
      this.$scope.stage.manifestArtifactAccount = artifact.artifactAccount;
      this.$scope.artifact = { ...artifact, source: 'inlineArtifact' };
    });
  };
}
