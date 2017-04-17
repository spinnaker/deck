'use strict';

import _ from 'lodash';
let angular = require('angular');

import {StageConstants} from 'core/pipeline/config/stages/stageConstants';
import {ACCOUNT_SERVICE} from 'core/account/account.service';
import {NAMING_SERVICE} from 'core/naming/naming.service';

module.exports = angular.module('spinnaker.core.pipeline.stage.gce.cloneServerGroupStage', [
  require('core/application/modal/platformHealthOverride.directive.js'),
  ACCOUNT_SERVICE,
  NAMING_SERVICE,
  require('./cloneServerGroupExecutionDetails.controller.js'),
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'cloneServerGroup',
      cloudProvider: 'gce',
      templateUrl: require('./cloneServerGroupStage.html'),
      executionDetailsUrl: require('./cloneServerGroupExecutionDetails.html'),
      executionStepLabelUrl: require('./cloneServerGroupStepLabel.html'),
      validators: [
        { type: 'requiredField', fieldName: 'targetCluster', fieldLabel: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'region', },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'}
      ],
    });
  }).controller('gceCloneServerGroupStageCtrl', function($scope, accountService, namingService) {

    let stage = $scope.stage;

    $scope.viewState = {
      accountsLoaded: false,
    };

    accountService.listAccounts('gce').then((accounts) => {
      $scope.accounts = accounts;
      $scope.viewState.accountsLoaded = true;
    });

    this.cloneTargets = StageConstants.TARGET_LIST;
    stage.target = stage.target || this.cloneTargets[0].val;
    stage.application = $scope.application.name;
    stage.cloudProvider = 'gce';
    stage.cloudProviderType = 'gce';

    if (stage.isNew && $scope.application.attributes.platformHealthOnlyShowOverride && $scope.application.attributes.platformHealthOnly) {
      stage.interestingHealthProviderNames = ['Google'];
    }

    if (!stage.credentials && $scope.application.defaultCredentials.gce) {
      stage.credentials = $scope.application.defaultCredentials.gce;
    }

    this.targetClusterUpdated = () => {
      if (stage.targetCluster) {
        let clusterName = namingService.parseServerGroupName(stage.targetCluster);
        stage.stack = clusterName.stack;
        stage.freeFormDetails = clusterName.freeFormDetails;
      } else {
        stage.stack = '';
        stage.freeFormDetails = '';
      }
    };

    $scope.$watch('stage.targetCluster', this.targetClusterUpdated);

    this.removeCapacity = () => {
      delete stage.capacity;
    };

    if (!_.has(stage, 'useSourceCapacity')) {
      stage.useSourceCapacity = true;
    }

    this.toggleDisableTraffic = () => {
      stage.disableTraffic = !stage.disableTraffic;
    };
  });

