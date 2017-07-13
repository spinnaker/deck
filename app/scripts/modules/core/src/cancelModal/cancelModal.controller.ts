import { module, IComponentController, IScope } from 'angular';
import { IModalServiceInstance } from 'angular-ui-bootstrap';

import './cancel.less';

export interface ICancelModalScope extends IScope {
  state: any;
  params: any;
  errorMessage: string;
}

export class CancelModalCtrl implements IComponentController {

  constructor(public $scope: ICancelModalScope, private $uibModalInstance: IModalServiceInstance, private params: any) {
    this.$scope.params = params;

    this.$scope.state = {
      submitting: false
    };
  }

  public formDisabled = () => this.$scope.state.submitting;

  public showError(exception: string): void {
    this.$scope.state.error = true;
    this.$scope.state.submitting = false;
    this.$scope.errorMessage = exception;
  }

  public confirm(): void {
    if (!this.formDisabled()) {
      this.$scope.state.submitting = true;
      this.params.submitMethod(this.params.reason, this.params.force).then(this.$uibModalInstance.close, this.showError);
    }
  };

  public cancel = () => this.$uibModalInstance.dismiss();

  // Satisfy TypeScript 2.4 breaking change: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#weak-type-detection
  public $onInit() {}
}

export const CANCEL_MODAL_CONTROLLER = 'spinnaker.core.cancelModal.controller';
module(CANCEL_MODAL_CONTROLLER, [
  require('angular-ui-bootstrap')
]).controller('cancelModalCtrl', CancelModalCtrl);
