import React from 'react';
import { IScope } from 'angular';
import { IModalService } from 'angular-ui-bootstrap';
import { OverrideRegistry, ModalInjector, ReactInjector, Application, IManifest } from '@spinnaker/core';
import { IKubernetesServerGroupManager } from 'kubernetes/interfaces';

export interface IScaleServerGroupManagerProps {
  serverGroupManager: IKubernetesServerGroupManager;
  app: Application;
  manifest: IManifest;
}

export class ScaleServerGroupManager extends React.Component<IScaleServerGroupManagerProps, {}> {
  private $rootScope: IScope;
  private $uibModal: IModalService;
  private overrideRegistry: OverrideRegistry;

  constructor(props: IScaleServerGroupManagerProps) {
    super(props);
    this.$uibModal = ModalInjector.modalService;
    this.$rootScope = ReactInjector.$rootScope;
    this.overrideRegistry = ReactInjector.overrideRegistry;
  }

  private scale = () => {
    this.$uibModal
      .open({
        scope: this.$rootScope.$new(),
        templateUrl: this.overrideRegistry.getTemplate(
          'scaleServerGroupManagerModal',
          require('../../manifest/scale/scale.html'),
        ),
        controller: this.overrideRegistry.getController('kubernetesV2ManifestScaleCtrl'),
        controllerAs: 'ctrl',
        resolve: {
          coordinates: {
            name: this.props.serverGroupManager.name,
            namespace: this.props.serverGroupManager.namespace,
            account: this.props.serverGroupManager.account,
          },
          currentReplicas: this.props.manifest.manifest.spec.replicas,
          application: this.props.app,
        },
      })
      .result.catch(() => {});
  };

  public render() {
    return <span onClick={this.scale}>Scale</span>;
  }
}
