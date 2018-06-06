import { IController, module } from 'angular';
import { V2_WIZARD_PAGE_COMPONENT } from './v2wizardPage.component';
import { ModalWizard } from './ModalWizard';

import './modalWizard.less';

export class V2ModalWizard implements IController {
  public wizard: any;
  public heading: string;
  public taskMonitor: any;
  public dismiss: () => any;

  public constructor(private $scope: ng.IScope) {
    'ngInject';
    this.wizard = ModalWizard;
  }

  public $onInit() {
    this.$scope.$on('waypoints-changed', (_event: any, snapshot: any) => {
      const ids = snapshot.lastWindow.map((entry: any) => entry.elem).filter((key: string) => ModalWizard.getPage(key));
      ids.reverse().forEach((id: string) => {
        ModalWizard.setCurrentPage(ModalWizard.getPage(id), true);
      });
    });

    ModalWizard.setHeading(this.heading);
  }

  public $onDestroy() {
    ModalWizard.resetWizard();
  }
}

class V2ModalWizardComponent implements ng.IComponentOptions {
  public bindings: any = {
    heading: '@',
    taskMonitor: '<',
    dismiss: '&',
  };

  public transclude = true;
  public templateUrl: string = require('./v2modalWizard.component.html');
  public controller: any = V2ModalWizard;
}

export const V2_MODAL_WIZARD_COMPONENT = 'spinnaker.core.modal.wizard.wizard.component';
module(V2_MODAL_WIZARD_COMPONENT, [V2_WIZARD_PAGE_COMPONENT]).component('v2ModalWizard', new V2ModalWizardComponent());
