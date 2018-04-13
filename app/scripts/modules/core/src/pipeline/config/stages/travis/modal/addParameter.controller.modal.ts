import { IController, module } from 'angular';
import { IModalInstanceService } from 'angular-ui-bootstrap';

export class TravisStageAddParameter implements IController {
  constructor(private $scope: ng.IScope, private $uibModalInstance: IModalInstanceService) {
    'ngInject';
  }

  public submit(): void {
    this.$uibModalInstance.close(this.$scope.parameter);
  }
}

export const TRAVIS_STAGE_ADD_PARAMETER_MODAL_CONTROLLER = 'spinnaker.core.pipeline.stage.travis.modal.addParameter';

module(TRAVIS_STAGE_ADD_PARAMETER_MODAL_CONTROLLER, []).controller(
  'TravisStageAddParameterCtrl',
  TravisStageAddParameter,
);
