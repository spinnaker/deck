import { IComponentOptions, module } from 'angular';

export class StagePlatformHealthOverrideWrapperDirective implements IComponentOptions {
  public bindings: any = {
    application: '<',
    stage: '<',
    platformHealthType: '<',
  };
  public template = `
    <stage-platform-health-override
      application="$ctrl.application"
      stage="$ctrl.stage"
      platform-health-type="$ctrl.platformHealthType">
    </stage-platform-health-override>
  `;
}

export const STAGE_PLATFORM_HEALTH_OVERRIDE_WRAPPER =
  'spinnaker.pipeline.config.health.stagePlatformHealthOverride.directive';
module(STAGE_PLATFORM_HEALTH_OVERRIDE_WRAPPER, []).component(
  'stagePlatformHealthOverrideWrapper',
  new StagePlatformHealthOverrideWrapperDirective(),
);
