import { IComponentOptions, IController, module } from 'angular';

class KubernetesTolerationsController implements IController {
  public tolerations: any;

  public addToleration() {
    if (!this.tolerations) {
      this.tolerations = [];
    }

    this.tolerations.push({
      key: '',
      operator: 'Equal',
      effect: 'NoSchedule',
      value: '',
    });
  }

  public removeToleration(index: any) {
    this.tolerations.splice(index, 1);
  }

  public operators(): string[] {
    return ['Exists', 'Equal'];
  }

  public effects(): string[] {
    return ['NoSchedule', 'PreferNoSchedule', 'NoExecute'];
  }
}

class KubernetesTolerationsComponent implements IComponentOptions {
  public bindings: any = { tolerations: '=' };
  public controller: any = KubernetesTolerationsController;
  public controllerAs: any = 'ctrl';
  public template = `
  <form name="tolerations">
    <div class="sm-label-left">Tolerations</div>
    <table class="table table-condensed">
      <tbody>
        <tr ng-repeat="toleration in ctrl.tolerations">
          <td>
            <div class="form-group">
                <div class="col-md-3 sm-label-right">
                  Key
                  <help-field key="kubernetes.serverGroup.tolerations.key"></help-field>
                </div>
                <div class="col-md-3">
                  <input class="form-control input input-sm" type="text" ng-model="toleration.key"/>
                </div>
                <div class="col-md-2 col-md-offset-1">
                  <button class="btn btn-sm btn-default" ng-click="ctrl.removeToleration($index)">
                    <span class="glyphicon glyphicon-trash visible-lg-inline"></span>
                    <span>Remove</span>
                  </button>
                </div>
            </div>
            <div class="form-group">
                <div class="col-md-3 sm-label-right">
                  Operator
                  <help-field key="kubernetes.serverGroup.tolerations.operator"></help-field>
                </div>
                <div class="col-md-3">
                  <select class="form-control input-sm"
                      ng-model="toleration.operator"
                      ng-options="operator for operator in ctrl.operators()"></select>
                </div>
            </div>
            <div class="form-group">
                <div class="col-md-3 sm-label-right">
                  Effect
                  <help-field key="kubernetes.serverGroup.tolerations.effect"></help-field>
                </div>
                <div class="col-md-3">
                  <select class="form-control input-sm"
                      ng-model="toleration.effect"
                      ng-options="effect for effect in ctrl.effects()"></select>
                </div>
            </div>
            <div class="form-group">
                <div class="col-md-3 sm-label-right">
                  Value
                  <help-field key="kubernetes.serverGroup.tolerations.value"></help-field>
                </div>
                <div class="col-md-3">
                  <input class="form-control input input-sm" type="text" ng-model="toleration.value"/>
                </div>
            </div>
            <div class="form-group">
              <div class="col-md-3 sm-label-right">
                Toleration Seconds
                <help-field key="kubernetes.serverGroup.tolerations.tolerationSeconds"></help-field>
              </div>
              <div class="col-md-3">
                <input class="form-control input input-sm" type="number" ng-model="toleration.tolerationSeconds"/>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3">
            <button class="add-new btn btn-block btn-sm" ng-click="ctrl.addToleration()" style="margin-bottom: 0px;">
                <span class="glyphicon glyphicon-plus-sign"></span>Add Toleration
            </button>
          </td>
        <tr>
      </tbody>
    </table>
  </form>
  `;
}

export const KUBERNETES_TOLERATIONS = 'spinnaker.kubernetes.tolerations.component';
module(KUBERNETES_TOLERATIONS, []).component('kubernetesTolerations', new KubernetesTolerationsComponent());
