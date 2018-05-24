import { IComponentOptions, IController, module } from 'angular';

export interface IPatchCommand {
  manifestName: string;
  location: string;
  account: string;
  reason: string;
  options: IPatchOptions;
}

export interface IPatchOptions {
  mergeStrategy?: MergeStrategy;
}

export enum MergeStrategy {
  strategic = 'strategic',
  json = 'json',
  merge = 'merge',
}
class KubernetesPatchManifestOptionsFormCtrl implements IController {
  public options: IPatchOptions;
  // TODO(dibyom) Link to kubernetes documentation for each fields
  public mergeStrategies = MergeStrategy;
}

class KubernetesPatchManifestOptionsFormComponent implements IComponentOptions {
  public bindings: any = { options: '=' };
  public controller: any = KubernetesPatchManifestOptionsFormCtrl;
  public controllerAs = 'ctrl';

  public template = `
    <div class="form-horizontal">
      <div class="form-group form-inline">
        <div class="col-md-3 sm-label-right">
          Merge Strategy
          <!--<help-field key="kubernetes"></help-field>  TODO Help field-->
        </div>
        <div class="col-md-4">
          <div class="input-group">
            <select class="form-control input-sm" ng-model="ctrl.options.mergeStrategy">
              <option ng-repeat="strategy in ctrl.mergeStrategies"
                value="{{strategy}}"
                ng-selected="ctrl.options.mergeStrategy === strategy">{{strategy}}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}

export const KUBERNETES_PATCH_MANIFEST_OPTIONS_FORM =
  'spinnaker.kubernetes.v2.kubernetes.manifest.patch.options.component';
module(KUBERNETES_PATCH_MANIFEST_OPTIONS_FORM, []).component(
  'kubernetesPatchManifestOptionsForm',
  new KubernetesPatchManifestOptionsFormComponent(),
);
