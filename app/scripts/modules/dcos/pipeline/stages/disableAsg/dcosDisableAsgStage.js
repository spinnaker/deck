'use strict';

const angular = require('angular');

import { PipelineTemplates, StageConstants } from '@spinnaker/core';

module.exports = angular.module('spinnaker.dcos.pipeline.stage.disableAsgStage', [])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'disableServerGroup',
      alias: 'disableAsg',
      cloudProvider: 'dcos',
      templateUrl: require('./disableAsgStage.html'),
      executionDetailsUrl: PipelineTemplates.disableAsgExecutionDetails,
      executionStepLabelUrl: require('./disableAsgStepLabel.html'),
      validators: [
        {
          type: 'targetImpedance',
          message: 'This pipeline will attempt to disable a server group without deploying a new version into the same cluster.'
        },
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target', },
        { type: 'requiredField', fieldName: 'regions', },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'},
      ],
    });
  }).controller('dcosDisableAsgStageCtrl', function($scope, accountService) {

    let stage = $scope.stage;

    $scope.state = {
      accounts: false,
      regionsLoaded: false
    };

    accountService.listAccounts('dcos').then(function (accounts) {
      $scope.accounts = accounts;
      $scope.state.accounts = true;
    });


    $scope.targets = StageConstants.TARGET_LIST;

    stage.regions = stage.regions || [];
    stage.cloudProvider = 'dcos';

    if (!stage.credentials && $scope.application.defaultCredentials.dcos) {
      stage.credentials = $scope.application.defaultCredentials.dcos;
    }
    if (!stage.regions.length && $scope.application.defaultRegions.dcos) {
      stage.regions.push($scope.application.defaultRegions.dcos);
    }

    if (!stage.target) {
      stage.target = $scope.targets[0].val;
    }

  });
