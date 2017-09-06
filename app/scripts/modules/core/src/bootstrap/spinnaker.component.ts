import { IController } from 'angular';

import { bootstrapModule } from './bootstrap.module';
import { IFeatures, SETTINGS } from 'core/config/settings';

import { react2angular } from 'react2angular';
import { SpinnakerHeader } from 'core/header/SpinnakerHeader';

const template = `
  <div class="spinnaker-container">
    <div class="transition-overlay" ng-if="!authenticating && routing">
      <h1 us-spinner="{radius:30, width:8, length: 16}"></h1>
    </div>
    <div class="navbar-inverse">
      <spinnaker-header></spinnaker-header>
    </div>

    <div class="spinnaker-content">
      <div ui-view="main" ng-if="!authenticating"></div>
    </div>
  </div>
  <notifier></notifier>
`;

class SpinnakerController implements IController {
  public feature: IFeatures;
  constructor () {
    'ngInject';
    this.feature = SETTINGS.feature;
    react2angular(SpinnakerHeader);
  }
}

bootstrapModule.component('spinnaker', {
  template,
  controller: SpinnakerController,
});
