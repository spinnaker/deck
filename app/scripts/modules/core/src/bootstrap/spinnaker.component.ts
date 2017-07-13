import { IComponentController } from 'angular';

import { bootstrapModule } from './bootstrap.module';
import { OverrideRegistry } from 'core/overrideRegistry';
import { IFeatures, SETTINGS } from '@spinnaker/core';

const template = `
  <div class="spinnaker-container">
    <div class="transition-overlay" ng-if="!authenticating && routing">
      <h1 us-spinner="{radius:30, width:8, length: 16}"></h1>
    </div>
    <div class="spinnaker-header navbar navbar-inverse">
      <div ng-include="$ctrl.spinnakerHeaderTemplate"></div>
    </div>

    <div class="spinnaker-content">
      <div ui-view="main" ng-if="!authenticating"></div>
    </div>
  </div>
  <notifier></notifier>
`;

class SpinnakerController implements IComponentController {
  public spinnakerHeaderTemplate: string;
  public feature: IFeatures;
  constructor (overrideRegistry: OverrideRegistry) {
    'ngInject';
    this.spinnakerHeaderTemplate = overrideRegistry.getTemplate('spinnakerHeader', require('./spinnakerHeader.html'));
    this.feature = SETTINGS.feature;
  }

  // Satisfy TypeScript 2.4 breaking change: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#weak-type-detection
  public $onInit() {}
}

bootstrapModule.component('spinnaker', {
  template,
  controller: SpinnakerController,
});
