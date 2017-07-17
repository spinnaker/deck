import { IComponentController, IComponentOptions, module } from 'angular';
import { IModalService } from 'angular-ui-bootstrap';

import { Application, IServerGroup } from '@spinnaker/core';

class GceAddAutoHealingPolicyButtonCtrl implements IComponentController {
  public application: Application;
  public serverGroup: IServerGroup;

  constructor(private $uibModal: IModalService) { 'ngInject'; }

  public addAutoHealingPolicy(): void {
    this.$uibModal.open({
      templateUrl: require('./modal/upsertAutoHealingPolicy.modal.html'),
      controller: 'gceUpsertAutoHealingPolicyModalCtrl',
      controllerAs: 'ctrl',
      size: 'md',
      resolve: {
        serverGroup: () => this.serverGroup,
        application: () => this.application,
      }
    });
  }

  // Satisfy TypeScript 2.4 breaking change: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#weak-type-detection
  public $onInit() {}
}

class GceAddAutoHealingPolicyButton implements IComponentOptions {
  public bindings: any = {
    application: '<',
    serverGroup: '<',
  };
  public template = '<a href ng-click="$ctrl.addAutoHealingPolicy()">Create new autohealing policy</a>';
  public controller: any = GceAddAutoHealingPolicyButtonCtrl;
}

export const GCE_ADD_AUTOHEALING_POLICY_BUTTON = 'spinnaker.gce.addAutoHealingPolicyButton.component';
module(GCE_ADD_AUTOHEALING_POLICY_BUTTON, [])
  .component('gceAddAutoHealingPolicyButton', new GceAddAutoHealingPolicyButton());
