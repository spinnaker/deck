import { module } from 'angular';

import { Registry } from '@spinnaker/core';

import { AppengineHealth } from 'appengine/common/appengineHealth';
import { IAppengineStageScope } from 'appengine/domain/index';
import { AppengineStageCtrl } from '../appengineStage.controller';

class AppengineStopServerGroupStageCtrl extends AppengineStageCtrl {
  constructor(public $scope: IAppengineStageScope) {
    'ngInject';
    super($scope);

    super.setAccounts().then(() => {
      super.setStageRegion();
    });

    super.setStageCloudProvider();
    super.setTargets();
    super.setStageCredentials();

    if (
      $scope.stage.isNew &&
      $scope.application.attributes.platformHealthOnlyShowOverride &&
      $scope.application.attributes.platformHealthOnly
    ) {
      $scope.stage.interestingHealthProviderNames = [AppengineHealth.PLATFORM];
    }
  }
}

export const APPENGINE_STOP_SERVER_GROUP_STAGE = 'spinnaker.appengine.pipeline.stage.stopServerGroupStage';

module(APPENGINE_STOP_SERVER_GROUP_STAGE, [])
  .config(() => {
    Registry.pipeline.registerStage({
      label: 'Stop Server Group',
      description: 'Stops a server group.',
      key: 'stopAppEngineServerGroup',
      templateUrl: require('./stopServerGroupStage.html'),
      executionDetailsUrl: require('./stopServerGroupExecutionDetails.html'),
      executionConfigSections: ['stopServerGroupConfig', 'taskStatus'],
      executionStepLabelUrl: require('./stopServerGroupStepLabel.html'),
      controller: 'appengineStopServerGroupStageCtrl',
      controllerAs: 'stopServerGroupStageCtrl',
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
      cloudProvider: 'appengine',
    });
  })
  .controller('appengineStopServerGroupStageCtrl', AppengineStopServerGroupStageCtrl);
