import { IController, module } from 'angular';
import { IModalInstanceService } from 'angular-ui-bootstrap';

import { Application, IMoniker, ManifestWriter, SERVER_GROUP_WRITER, TaskMonitor } from '@spinnaker/core';

import {
  IKubernetesManifestCommand,
  IKubernetesManifestCommandMetadata,
  KubernetesManifestCommandBuilder,
} from '../manifestCommandBuilder.service';

class KubernetesEditManifestCtrl implements IController {
  public state = {
    loaded: false,
    isNew: false,
  };
  public taskMonitor: TaskMonitor;
  public command: IKubernetesManifestCommand;
  public metadata: IKubernetesManifestCommandMetadata;

  constructor(
    sourceManifest: any,
    sourceMoniker: IMoniker,
    private $uibModalInstance: IModalInstanceService,
    private application: Application,
  ) {
    'ngInject';
    KubernetesManifestCommandBuilder.buildNewManifestCommand(application, sourceManifest, sourceMoniker).then(
      builtCommand => {
        const { command, metadata } = builtCommand;
        this.command = command;
        this.command.versioned = false;
        this.metadata = metadata;

        this.initialize();
        this.state.loaded = true;
      },
    );
  }

  public cancel(): void {
    this.$uibModalInstance.dismiss();
  }

  public submit(): void {
    const command = KubernetesManifestCommandBuilder.copyAndCleanCommand(this.metadata, this.command);
    const submitMethod = () => ManifestWriter.deployManifest(command, this.application);
    this.taskMonitor.submit(submitMethod);
  }

  private initialize(): void {
    this.taskMonitor = new TaskMonitor({
      application: this.application,
      title: 'Updating your manifest',
      modalInstance: this.$uibModalInstance,
    });
  }

  public showSubmitButton(): boolean {
    return true;
  }

  public isValid(): boolean {
    return KubernetesManifestCommandBuilder.manifestCommandIsValid(this.command);
  }
}

export const KUBERNETES_EDIT_MANIFEST_CTRL = 'spinnaker.kubernetes.v2.manifest.edit.controller';
module(KUBERNETES_EDIT_MANIFEST_CTRL, [SERVER_GROUP_WRITER]).controller(
  'kubernetesV2ManifestEditCtrl',
  KubernetesEditManifestCtrl,
);
