import React from 'react';
import { IScope } from 'angular';
import { IModalService } from 'angular-ui-bootstrap';
import { orderBy } from 'lodash';
import { OverrideRegistry, NameUtils, ModalInjector, ReactInjector, Application } from '@spinnaker/core';
import { IKubernetesServerGroupManager } from 'kubernetes/interfaces';

export interface IUndoRollOutServerGroupManagerProps {
  serverGroupManager: IKubernetesServerGroupManager;
  app: Application;
}

export class UndoRollOutServerGroupManager extends React.Component<IUndoRollOutServerGroupManagerProps, {}> {
  private $rootScope: IScope;
  private $uibModal: IModalService;
  private overrideRegistry: OverrideRegistry;

  constructor(props: IUndoRollOutServerGroupManagerProps) {
    super(props);
    this.$uibModal = ModalInjector.modalService;
    this.$rootScope = ReactInjector.$rootScope;
    this.overrideRegistry = ReactInjector.overrideRegistry;
  }

  private undorollout = () => {
    this.$uibModal.open({
      scope: this.$rootScope.$new(),
      templateUrl: require('../../manifest/rollout/undo.html'),
      controller: this.overrideRegistry.getController('kubernetesV2ManifestUndoRolloutCtrl'),
      controllerAs: 'ctrl',
      resolve: {
        coordinates: {
          name: this.props.serverGroupManager.name,
          namespace: this.props.serverGroupManager.namespace,
          account: this.props.serverGroupManager.account,
        },
        revisions: () => {
          const [, ...rest] = orderBy(this.props.serverGroupManager.serverGroups, ['moniker.sequence'], ['desc']);
          return rest.map((serverGroup, index) => ({
            label: `${NameUtils.getSequence(serverGroup.moniker.sequence)}${index > 0 ? '' : ' - previous revision'}`,
            revision: serverGroup.moniker.sequence,
          }));
        },
        application: this.props.app,
      },
    });
  };

  public render() {
    return <span onClick={this.undorollout}>Undo rollout</span>;
  }
}
