'use strict';

import { module } from 'angular';

import { AccountService, Registry, StageConstants } from '@spinnaker/core';

export const SPOT_PIPELINE_STAGES_DISABLE_SERVER_GROUP_STAGE = 'spinnaker.spot.pipeline.stage.disableServerGroupStage';
export const name = SPOT_PIPELINE_STAGES_DISABLE_SERVER_GROUP_STAGE; // for backwards compatibility
module(SPOT_PIPELINE_STAGES_DISABLE_SERVER_GROUP_STAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'disableServerGroup',
      alias: 'disableServerGroup',
      cloudProvider: 'spot',
      templateUrl: require('./disableServerGroupStage.html'),
      executionStepLabelUrl: require('./disableServerGroupStepLabel.html'),
      validators: [
        {
          type: 'targetImpedance',
          message:
            'This pipeline will attempt to disable a server group without deploying a new version into the same cluster.',
        },
        {
          type: 'requiredField',
          fieldName: 'cluster',
        },
        {
          type: 'requiredField',
          fieldName: 'target',
        },
        {
          type: 'requiredField',
          fieldName: 'regions',
        },
        {
          type: 'requiredField',
          fieldName: 'credentials',
          fieldLabel: 'account',
        },
      ],
    });
  })
  .controller('spotDisableServerGroupStageCtrl', [
    '$scope',
    function($scope) {
      const stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('spot').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      $scope.targets = StageConstants.TARGET_LIST;

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'spot';

      if (
        stage.isNew &&
        $scope.application.attributes.platformHealthOnlyShowOverride &&
        $scope.application.attributes.platformHealthOnly
      ) {
        stage.interestingHealthProviderNames = ['Spot'];
      }

      if (!stage.credentials && $scope.application.defaultCredentials.spot) {
        stage.credentials = $scope.application.defaultCredentials.spot;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.spot) {
        stage.regions.push($scope.application.defaultRegions.spot);
      }

      if (!stage.target) {
        stage.target = $scope.targets[0].val;
      }
    },
  ]);
