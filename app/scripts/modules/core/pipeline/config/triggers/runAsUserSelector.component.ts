import {module} from 'angular';

class RunAsUserSelectorCtrl implements ng.IComponentController {
  public state = {loading: true};
  public serviceAccounts: string[];
  private component: any;
  private field: string;

  public static get $inject() { return ['serviceAccountService']; }

  constructor(private serviceAccountService: any) {}

  public $onInit(): void {
    this.serviceAccountService.getServiceAccounts()
      .then((serviceAccounts: string[]) => {
        this.serviceAccounts = serviceAccounts || [];

        if (!this.serviceAccounts.includes(this.component[this.field])) {
          this.component[this.field] = undefined;
        }

       this.state.loading = false;
      });
  }
}

class RunAsUserSelectorComponent implements ng.IComponentOptions {
  public bindings: any = {
    component: '=',
    field: '@',
  };
  public template: string = `
    <div class="col-md-3 sm-label-right">
      Run As User
      <help-field key="pipeline.config.trigger.runAsUser"></help-field>
    </div>
    <div class="col-md-9" ng-if="!$ctrl.state.loading">
      <select
        class="form-control input-sm"
        ng-options="svcAcct for svcAcct in $ctrl.serviceAccounts"
        ng-model="$ctrl.component[$ctrl.field]">
        <option value="">Select Run As User</option>
      </select>
    </div>
    <div class="col-md-9" ng-if="$ctrl.state.loading">
      <h4 class="text-center">
        <span us-spinner="{radius:5, width:2, length: 3}"></span>
      </h4>
    </div>
  `;

  public controller: any = RunAsUserSelectorCtrl;
}

export const RUN_AS_USER_SELECTOR_COMPONENT = 'spinnaker.core.runAsUser.selector.component';
module(RUN_AS_USER_SELECTOR_COMPONENT, [require('core/serviceAccount/serviceAccount.service.js')])
  .component('runAsUserSelector', new RunAsUserSelectorComponent());
