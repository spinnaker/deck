import { IScope, IController } from 'angular';

import { IManifestSelector } from '../../../manifest/selector/IManifestSelector';

export class KubernetesV2ResizeManifestConfigCtrl implements IController {
  constructor(private $scope: IScope) {
    'ngInject';
    if (this.$scope.stage.isNew) {
      const defaultSelection: IManifestSelector = {
        manifestName: '',
        location: '',
        account: '',
        kinds: [],
        labelSelectors: {
          selectors: [],
        }
      };
      Object.assign(this.$scope.stage, defaultSelection);
    }
  }
}
