import { IController, module } from 'angular';
import { IModalInstanceService } from 'angular-ui-bootstrap';

export class WerckerStageAddParameter implements IController {
  constructor(private $scope: ng.IScope, private $uibModalInstance: IModalInstanceService) {
    'ngInject';
  }

  public submit(): void {
    this.$uibModalInstance.close(this.$scope.parameter);
  }
}

export const WERCKER_STAGE_ADD_PARAMETER_MODAL_CONTROLLER = 'spinnaker.core.pipeline.stage.wercker.modal.addParameter';

module(WERCKER_STAGE_ADD_PARAMETER_MODAL_CONTROLLER, []).controller(
  'WerckerStageAddParameterCtrl',
  WerckerStageAddParameter,
);
