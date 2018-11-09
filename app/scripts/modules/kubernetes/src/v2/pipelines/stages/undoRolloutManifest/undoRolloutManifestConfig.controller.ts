import { IController, IScope } from 'angular';

export class KubernetesV2UndoRolloutManifestConfigCtrl implements IController {
  constructor(private $scope: IScope) {
    'ngInject';
    if (this.$scope.stage.isNew) {
      Object.assign(this.$scope.stage, {
        location: '',
        account: '',
        cloudProvider: 'kubernetes',
        numRevisionsBack: 1,
      });
    }
  }

  public handleManifestSelectorChange = (): void => {
    this.$scope.$applyAsync();
  };
}
