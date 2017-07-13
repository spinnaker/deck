import { IComponentController, module } from 'angular';
import { IModalInstanceService } from 'angular-ui-bootstrap';

export class WebhookStageAddCustomHeader implements IComponentController {
  constructor (private $scope: ng.IScope, private $uibModalInstance: IModalInstanceService) { 'ngInject'; }

  public submit(): void {
    this.$uibModalInstance.close(this.$scope.customHeader);
  }

  // Satisfy TypeScript 2.4 breaking change: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#weak-type-detection
  public $onInit() {}
}

export const WEBHOOK_STAGE_ADD_CUSTOM_HEADER_MODAL_CONTROLLER = 'spinnaker.core.pipeline.stage.webhookStage.modal.addCustomHeader';

module(WEBHOOK_STAGE_ADD_CUSTOM_HEADER_MODAL_CONTROLLER,
       [],
).controller('WebhookStageAddCustomHeaderCtrl', WebhookStageAddCustomHeader);
