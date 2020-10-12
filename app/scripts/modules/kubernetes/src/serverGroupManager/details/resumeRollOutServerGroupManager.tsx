import React from 'react';
import { IScope } from 'angular';
import { IModalService } from 'angular-ui-bootstrap';
import { OverrideRegistry, ModalInjector, ReactInjector, Application } from '@spinnaker/core';
import { IKubernetesServerGroupManager } from 'kubernetes/interfaces';

export interface IResumeRollOutServerGroupManagerProps {
  serverGroupManager: IKubernetesServerGroupManager;
  app: Application;
}

export class ResumeRollOutServerGroupManager extends React.Component<IResumeRollOutServerGroupManagerProps, {}> {
  private $rootScope: IScope;
  private $uibModal: IModalService;
  private overrideRegistry: OverrideRegistry;

  constructor(props: IResumeRollOutServerGroupManagerProps) {
    super(props);
    this.$uibModal = ModalInjector.modalService;
    this.$rootScope = ReactInjector.$rootScope;
    this.overrideRegistry = ReactInjector.overrideRegistry;
  }

  private resumerollout = () => {
    this.$uibModal.open({
      scope: this.$rootScope.$new(),
      templateUrl: require('../../manifest/rollout/resume.html'),
      controller: this.overrideRegistry.getController('kubernetesV2ManifestResumeRolloutCtrl'),
      controllerAs: 'ctrl',
      resolve: {
        coordinates: {
          name: this.props.serverGroupManager.name,
          namespace: this.props.serverGroupManager.namespace,
          account: this.props.serverGroupManager.account,
        },

        application: this.props.app,
      },
    });
  };

  public render() {
    return <span onClick={this.resumerollout}>Resume rollout</span>;
  }
}
