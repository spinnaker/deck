import { IComponentOptions, module } from 'angular';

class KubernetesScaleManifestSettingsFormComponent implements IComponentOptions {
  public bindings: any = { settings: '=' };
  public controllerAs = 'ctrl';
  public template = `
    <div class="form-horizontal">
      <div class="form-group form-inline">
        <div class="col-md-3 sm-label-right">
          Replicas
        </div>
        <div class="col-md-4">
          <div class="input-group">
            <input type="number"
                  class="form-control input-sm highlight-pristine"
                  ng-model="ctrl.settings.replicas"
                  min="0"/>
          </div>
        </div>
      </div>
    </div>
  `;
}

export const KUBERNETES_SCALE_MANIFEST_SETTINGS_FORM =
  'spinnaker.kubernetes.v2.kubernetes.manifest.scale.settingsForm.component';
module(KUBERNETES_SCALE_MANIFEST_SETTINGS_FORM, []).component(
  'kubernetesScaleManifestSettingsForm',
  new KubernetesScaleManifestSettingsFormComponent(),
);
