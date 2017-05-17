import { module } from 'angular';

import { ACCOUNT_SERVICE, AccountService } from '@spinnaker/core';

import { AppengineHealth } from 'appengine/common/appengineHealth';
import { IAppengineStageScope } from 'appengine/domain/index';
import { AppengineStageCtrl } from '../appengineStage.controller';

class AppengineStartServerGroupStageCtrl extends AppengineStageCtrl {
  constructor(public $scope: IAppengineStageScope, protected accountService: AccountService) {
    'ngInject';
    super($scope, accountService);

    super.setAccounts().then(() => { super.setStageRegion(); });

    super.setStageCloudProvider();
    super.setTargets();
    super.setStageCredentials();

    if ($scope.stage.isNew &&
        $scope.application.attributes.platformHealthOnlyShowOverride &&
        $scope.application.attributes.platformHealthOnly) {
      $scope.stage.interestingHealthProviderNames = [AppengineHealth.PLATFORM];
    }
  }
}

export const APPENGINE_START_SERVER_GROUP_STAGE = 'spinnaker.appengine.pipeline.stage.startServerGroupStage';

module(APPENGINE_START_SERVER_GROUP_STAGE, [ACCOUNT_SERVICE])
  .config(function(pipelineConfigProvider: any) {
    pipelineConfigProvider.registerStage({
      label: 'Start Server Group',
      description: 'Starts a server group.',
      key: 'startAppEngineServerGroup',
      templateUrl: require('./startServerGroupStage.html'),
      executionDetailsUrl: require('./startServerGroupExecutionDetails.html'),
      executionConfigSections: ['startServerGroupConfig', 'taskStatus'],
      executionStepLabelUrl: require('./startServerGroupStepLabel.html'),
      controller: 'appengineStartServerGroupStageCtrl',
      controllerAs: 'startServerGroupStageCtrl',
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'},
      ],
      cloudProvider: 'appengine',
    });
  })
  .controller('appengineStartServerGroupStageCtrl', AppengineStartServerGroupStageCtrl);
