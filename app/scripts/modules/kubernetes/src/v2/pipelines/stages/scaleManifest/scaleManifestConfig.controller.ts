import { IController, IScope } from 'angular';
import { defaults } from 'lodash';

import { IManifestSelector } from 'kubernetes/v2/manifest/selector/IManifestSelector';
import { Application } from '@spinnaker/core';

export class KubernetesV2ScaleManifestConfigCtrl implements IController {
  public application: Application;

  constructor(private $scope: IScope) {
    'ngInject';
    if (this.$scope.stage.isNew) {
      this.application = this.$scope.$parent.application;
      const defaultSelection: IManifestSelector = {
        location: '',
        account: '',
      };
      defaults(this.$scope.stage, defaultSelection);
      const defaultOptions: any = {
        replicas: null,
        app: this.application.name,
      };
      defaults(this.$scope.stage, defaultOptions);
      this.$scope.stage.cloudProvider = 'kubernetes';
    }
  }

  public handleManifestSelectorChange = (): void => {
    this.$scope.$applyAsync();
  };
}
