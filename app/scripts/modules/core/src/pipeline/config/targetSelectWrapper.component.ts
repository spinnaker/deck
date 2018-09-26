import { IComponentOptions, module } from 'angular';

export class TargetSelectWrapperComponent implements IComponentOptions {
  public bindings: any = {
    model: '<',
    options: '<',
  };
  public template = `
    <target-select
      model="$ctrl.model"
      options="$ctrl.options"
    </target-select>
  `;
}

export const TARGET_SELECT_WRAPPER = 'spinnaker.core.pipeline.config.targetSelectWrapper.component';
module(TARGET_SELECT_WRAPPER, []).component('targetSelectWrapper', new TargetSelectWrapperComponent());
