'use strict';

import { module } from 'angular';
import _ from 'lodash';

import { AccountService, AppListExtractor, NameUtils, Registry, StageConstants } from '@spinnaker/core';

export const SPOT_PIPELINE_STAGES_CREATESERVERGROUP_SPOTCREATESERVERGROUPSTAGE =
  'spinnaker.spot.pipeline.stage.createServerGroupStage';
export const name = SPOT_PIPELINE_STAGES_CREATESERVERGROUP_SPOTCREATESERVERGROUPSTAGE; // for backwards compatibility
module(SPOT_PIPELINE_STAGES_CREATESERVERGROUP_SPOTCREATESERVERGROUPSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'deployElastigroup',
      cloudProvider: 'spot',
      templateUrl: require('./createServerGroupStage.html'),
      executionStepLabelUrl: require('./createServerGroupStepLabel.html'),
      accountExtractor: stage => [stage.context.credentials],
      validators: [
        { type: 'requiredField', fieldName: 'payload' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('spotCreateServerGroupStageCtrl', [
    '$scope',
    function($scope) {
      const stage = $scope.stage;

      $scope.viewState = {
        accountsLoaded: false,
      };

      AccountService.listAccounts('spot').then(accounts => {
        $scope.accounts = accounts;
        $scope.viewState.accountsLoaded = true;
      });

      stage.payload = $scope.payload;
      stage.application = $scope.application.name;
      stage.cloudProvider = 'spot';
      stage.cloudProviderType = 'spot';

      if (!stage.credentials && $scope.application.defaultCredentials.spot) {
        stage.credentials = $scope.application.defaultCredentials.spot;
      }
    },
  ]);
