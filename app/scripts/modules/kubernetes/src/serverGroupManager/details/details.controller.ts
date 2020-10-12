import { IController, IScope, module } from 'angular';
import { IModalService } from 'angular-ui-bootstrap';
import { StateService } from '@uirouter/angularjs';
import { ScaleServerGroupManager } from './scaleServerGroupManager';
import { UndoRollOutServerGroupManager } from './undoRollOutServerGroupManager';
import { ResumeRollOutServerGroupManager } from './resumeRollOutServerGroupManager';
import { react2angular } from 'react2angular';

import {
  Application,
  IManifest,
  IServerGroupManager,
  IServerGroupManagerStateParams,
  ClusterTargetBuilder,
  IOwnerOption,
  ManifestReader,
} from '@spinnaker/core';

import { IKubernetesServerGroupManager } from '../../interfaces';
import { KubernetesManifestCommandBuilder } from '../../manifest/manifestCommandBuilder.service';
import { ManifestWizard } from '../../manifest/wizard/ManifestWizard';

class KubernetesServerGroupManagerDetailsController implements IController {
  public serverGroupManager: IKubernetesServerGroupManager;
  public state = { loading: true };
  public manifest: IManifest;
  public entityTagTargets: IOwnerOption[];

  public static $inject = ['serverGroupManager', '$scope', '$uibModal', 'app', '$state'];
  constructor(
    serverGroupManager: IServerGroupManagerStateParams,
    private $scope: IScope,
    private $uibModal: IModalService,
    public app: Application,
    private $state: StateService,
  ) {
    const dataSource = this.app.getDataSource('serverGroupManagers');
    dataSource
      .ready()
      .then(() => {
        this.extractServerGroupManager(serverGroupManager);
        dataSource.onRefresh(this.$scope, () => this.extractServerGroupManager(serverGroupManager));
      })
      .catch(() => this.autoClose());
  }

  public pauseRolloutServerGroupManager(): void {
    this.$uibModal.open({
      templateUrl: require('../../manifest/rollout/pause.html'),
      controller: 'kubernetesV2ManifestPauseRolloutCtrl',
      controllerAs: 'ctrl',
      resolve: {
        coordinates: {
          name: this.serverGroupManager.name,
          namespace: this.serverGroupManager.namespace,
          account: this.serverGroupManager.account,
        },
        application: this.app,
      },
    });
  }

  public canUndoRollOutServerGroupManager(): boolean {
    return (
      this.serverGroupManager && this.serverGroupManager.serverGroups && this.serverGroupManager.serverGroups.length > 0
    );
  }

  public editServerGroupManager(): void {
    KubernetesManifestCommandBuilder.buildNewManifestCommand(
      this.app,
      this.manifest.manifest,
      this.serverGroupManager.moniker,
      this.serverGroupManager.account,
    ).then(builtCommand => {
      ManifestWizard.show({ title: 'Edit Manifest', application: this.app, command: builtCommand });
    });
  }

  public deleteServerGroupManager(): void {
    this.$uibModal.open({
      templateUrl: require('../../manifest/delete/delete.html'),
      controller: 'kubernetesV2ManifestDeleteCtrl',
      controllerAs: 'ctrl',
      resolve: {
        coordinates: {
          name: this.serverGroupManager.name,
          namespace: this.serverGroupManager.namespace,
          account: this.serverGroupManager.account,
        },
        application: this.app,
        manifestController: (): string => null,
      },
    });
  }

  private extractServerGroupManager({ accountId, region, serverGroupManager }: IServerGroupManagerStateParams): void {
    const serverGroupManagerDetails = this.app
      .getDataSource('serverGroupManagers')
      .data.find(
        (manager: IServerGroupManager) =>
          manager.name === serverGroupManager && manager.region === region && manager.account === accountId,
      );

    if (!serverGroupManagerDetails) {
      return this.autoClose();
    }

    ManifestReader.getManifest(accountId, region, serverGroupManager).then((manifest: IManifest) => {
      this.manifest = manifest;
      this.serverGroupManager = serverGroupManagerDetails;
      this.entityTagTargets = this.configureEntityTagTargets();
      this.state.loading = false;
    });
  }

  private configureEntityTagTargets(): IOwnerOption[] {
    return ClusterTargetBuilder.buildManagerClusterTargets(this.serverGroupManager);
  }

  private autoClose(): void {
    if (this.$scope.$$destroyed) {
      return;
    } else {
      this.$state.params.allowModalToStayOpen = true;
      this.$state.go('^', null, { location: 'replace' });
    }
  }
}

export const KUBERNETES_SERVER_GROUP_MANAGER_DETAILS_CTRL =
  'spinnaker.kubernetes.serverGroupManager.details.controller';
module(KUBERNETES_SERVER_GROUP_MANAGER_DETAILS_CTRL, [])
  .controller('kubernetesV2ServerGroupManagerDetailsCtrl', KubernetesServerGroupManagerDetailsController)
  .component(
    'scaleServerGroupManager',
    react2angular(ScaleServerGroupManager, ['serverGroupManager', 'app', 'manifest']),
  )
  .component(
    'undoRollOutServerGroupManager',
    react2angular(UndoRollOutServerGroupManager, ['serverGroupManager', 'app']),
  )
  .component(
    'resumeRollOutServerGroupManager',
    react2angular(ResumeRollOutServerGroupManager, ['serverGroupManager', 'app']),
  );
