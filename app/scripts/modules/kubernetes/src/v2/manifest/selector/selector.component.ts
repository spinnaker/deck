import { IComponentOptions, IQService, IController, module } from 'angular';

import { AccountService, IAccountDetails } from '@spinnaker/core';
import { KUBERNETES_MANIFEST_LABEL_EDITOR } from './labelEditor/labelEditor.component';
import { IManifestSelector } from './IManifestSelector';

class KubernetesManifestSelectorCtrl implements IController {
  public selector: IManifestSelector;
  public accounts: IAccountDetails;
  public kindsMetadata: string;

  constructor(private $q: IQService, private accountService: AccountService) {
    'ngInject';
    const dataToFetch = {
      accounts: this.accountService.getAllAccountDetailsForProvider('kubernetes', 'v2'),
    };
    this.$q.all(dataToFetch)
      .then((fetchedData: any) => {
        this.accounts = fetchedData.accounts;
    });
    this.kindsMetadata = this.selector.kinds.join(', ');
  }

  public stringToArray() {
    this.selector.kinds = this.kindsMetadata.split(',').map( e => e.trim() );
  }
}

class KubernetesManifestSelectorComponent implements IComponentOptions {
  public bindings: any = { selector: '=' };
  public controller: any = KubernetesManifestSelectorCtrl;
  public controllerAs = 'ctrl';
  public template = `
    <form name="manifestSelectorForm">
      <stage-config-field label="Account">
        <account-select-field component="ctrl.selector"
          field="account"
          accounts="ctrl.accounts"
          provider="'kubernetes'"></account-select-field>
      </stage-config-field>
      <stage-config-field label="Name">
        <input type="text" placeholder="Optional"
          class="form-control input-sm highlight-pristine"
          ng-model="ctrl.selector.manifestName"/>
      </stage-config-field>
      <stage-config-field label="Kinds">
        <input type="text" placeholder="Comma seperated. Ex: deployment, replicaSet"
          class="form-control input-sm highlight-pristine"
          ng-model="ctrl.kindsMetadata" ng-change="ctrl.stringToArray()"/>
      </stage-config-field>
      <stage-config-field label="Namespace">
        <input type="text"
          class="form-control input-sm highlight-pristine"
          ng-model="ctrl.selector.location"/>
      </stage-config-field>
      <stage-config-field label="Labels">
        <kubernetes-manifest-label-editor selectors="ctrl.selector.labelSelectors.selectors"></kubernetes-manifest-label-editor>
      </stage-config-field>
    </div>
  `;
}

export const KUBERNETES_MANIFEST_SELECTOR = 'spinnaker.kubernetes.v2.manifest.selector.component';
module(KUBERNETES_MANIFEST_SELECTOR, [
    KUBERNETES_MANIFEST_LABEL_EDITOR,
  ]).component('kubernetesManifestSelector', new KubernetesManifestSelectorComponent());
