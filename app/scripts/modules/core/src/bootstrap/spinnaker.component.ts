import { IController } from 'angular';

import { bootstrapModule } from './bootstrap.module';
import { IFeatures, SETTINGS } from 'core/config/settings';
import { IDeckRootScope } from 'core/domain';

const template = `
  <spinnaker-container authenticating="$ctrl.authenticating" routing="$ctrl.routing"></spinnaker-container>
  <notifier></notifier>
`;

class SpinnakerController implements IController {
  public feature: IFeatures;
  public static $inject = ['$rootScope'];
  constructor($rootScope: IDeckRootScope) {
    this.feature = SETTINGS.feature;
    this.authenticating = $rootScope.authenticating;
    this.routing = $rootScope.routing;
  }
}

bootstrapModule.component('spinnaker', {
  template,
  controller: SpinnakerController,
});
