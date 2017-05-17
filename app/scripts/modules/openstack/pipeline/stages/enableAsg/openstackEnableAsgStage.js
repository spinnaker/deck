'use strict';

const angular = require('angular');

import { PipelineTemplates, StageConstants } from '@spinnaker/core';

module.exports = angular.module('spinnaker.openstack.pipeline.stage.enableAsgStage', [
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'enableServerGroup',
      alias: 'enableAsg',
      cloudProvider: 'openstack',
      templateUrl: require('./enableAsgStage.html'),
      executionDetailsUrl: PipelineTemplates.enableAsgExecutionDetails,
      executionStepLabelUrl: require('./enableAsgStepLabel.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target', },
        { type: 'requiredField', fieldName: 'regions', },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'},
      ],
    });
  }).controller('openstackEnableAsgStageCtrl', function($scope, accountService) {
    var ctrl = this;

    let stage = $scope.stage;

    $scope.state = {
      accounts: false,
      regionsLoaded: false
    };

    accountService.listAccounts('openstack').then(function (accounts) {
      $scope.accounts = accounts;
      $scope.state.accounts = true;
    });

    ctrl.reset = () => {
      ctrl.accountUpdated();
      ctrl.resetSelectedCluster();
    };

    $scope.targets = StageConstants.TARGET_LIST;

    stage.regions = stage.regions || [];
    stage.cloudProvider = 'openstack';

    if (stage.isNew && $scope.application.attributes.platformHealthOnlyShowOverride && $scope.application.attributes.platformHealthOnly) {
      stage.interestingHealthProviderNames = ['Openstack'];
    }

    if (!stage.credentials && $scope.application.defaultCredentials.openstack) {
      stage.credentials = $scope.application.defaultCredentials.openstack;
    }
    if (!stage.regions.length && $scope.application.defaultRegions.openstack) {
      stage.regions.push($scope.application.defaultRegions.openstack);
    }

    if (!stage.target) {
      stage.target = $scope.targets[0].val;
    }

    $scope.$watch('stage.credentials', $scope.accountUpdated);
  });

