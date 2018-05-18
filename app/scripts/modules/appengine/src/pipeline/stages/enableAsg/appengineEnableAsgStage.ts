import { module } from 'angular';

import { Registry } from '@spinnaker/core';

import { AppengineHealth } from 'appengine/common/appengineHealth';
import { IAppengineStageScope } from 'appengine/domain';
import { AppengineStageCtrl } from '../appengineStage.controller';

class AppengineEnableAsgStageCtrl extends AppengineStageCtrl {
  constructor(protected $scope: IAppengineStageScope) {
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

export const APPENGINE_ENABLE_ASG_STAGE = 'spinnaker.appengine.pipeline.stage.enableAsgStage';

module(APPENGINE_ENABLE_ASG_STAGE, [])
  .config(() => {
    Registry.pipeline.registerStage({
      provides: 'enableServerGroup',
      key: 'enableServerGroup',
      cloudProvider: 'appengine',
      templateUrl: require('./enableAsgStage.html'),
      executionStepLabelUrl: require('./enableAsgStepLabel.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('appengineEnableAsgStageCtrl', AppengineEnableAsgStageCtrl);
