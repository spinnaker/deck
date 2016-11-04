import {module} from 'angular';

class RunAsUserSelectorComponent implements ng.IComponentOptions {
  bindings: any = {
    serviceAccounts: '<',
    component: '=',
    field: '@',
  };
  template: string = `
    <div class="col-md-3 sm-label-right">
      Run As User
      <help-field key="pipeline.config.trigger.runAsUser"></help-field>
    </div>
    <div class="col-md-9">
      <select
        class="form-control input-sm"
        ng-options="svcAcct for svcAcct in $ctrl.serviceAccounts"
        ng-model="$ctrl.component[$ctrl.field]">
        <option value="">Select Run As User</option>
      </select>
    </div>
  `;
}

const moduleName = 'spinnaker.core.runAsUser.selector.component';

module(moduleName, [])
  .component('runAsUserSelector', new RunAsUserSelectorComponent());

export default moduleName;
