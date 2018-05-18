import { module } from 'angular';

import { Registry } from '@spinnaker/core';

import { AppengineHealth } from 'appengine/common/appengineHealth';
import { IAppengineStageScope } from 'appengine/domain';
import { AppengineStageCtrl } from '../appengineStage.controller';

class AppengineDisableAsgStageCtrl extends AppengineStageCtrl {
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

export const APPENGINE_DISABLE_ASG_STAGE = 'spinnaker.appengine.pipeline.stage.disableAsgStage';

module(APPENGINE_DISABLE_ASG_STAGE, [])
  .config(() => {
    Registry.pipeline.registerStage({
      provides: 'disableServerGroup',
      key: 'disableServerGroup',
      cloudProvider: 'appengine',
      templateUrl: require('./disableAsgStage.html'),
      executionStepLabelUrl: require('./disableAsgStepLabel.html'),
      validators: [
        {
          type: 'targetImpedance',
          message:
            'This pipeline will attempt to disable a server group without deploying a new version into the same cluster.',
        },
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('appengineDisableAsgStageCtrl', AppengineDisableAsgStageCtrl);
