'use strict';

const angular = require('angular');
import _ from 'lodash';

import { ACCOUNT_SERVICE, NAMING_SERVICE, StageConstants } from '@spinnaker/core';

module.exports = angular.module('spinnaker.amazon.pipeline.stage.cloneServerGroupStage', [
  ACCOUNT_SERVICE,
  NAMING_SERVICE,
  require('./cloneServerGroupExecutionDetails.controller.js'),
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'cloneServerGroup',
      cloudProvider: 'aws',
      templateUrl: require('./cloneServerGroupStage.html'),
      executionDetailsUrl: require('./cloneServerGroupExecutionDetails.html'),
      executionStepLabelUrl: require('./cloneServerGroupStepLabel.html'),
      accountExtractor: (stage) => stage.context.credentials,
      validators: [
        { type: 'requiredField', fieldName: 'targetCluster', fieldLabel: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'region', },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'}
      ],
    });
  }).controller('awsCloneServerGroupStageCtrl', function($scope, accountService, namingService) {

    let stage = $scope.stage;

    $scope.viewState = {
      accountsLoaded: false,
    };

    accountService.listAccounts('aws').then((accounts) => {
      $scope.accounts = accounts;
      $scope.viewState.accountsLoaded = true;
    });

    this.cloneTargets = StageConstants.TARGET_LIST;
    stage.target = stage.target || this.cloneTargets[0].val;
    stage.application = $scope.application.name;
    stage.cloudProvider = 'aws';
    stage.cloudProviderType = 'aws';

    if (stage.isNew && $scope.application.attributes.platformHealthOnlyShowOverride && $scope.application.attributes.platformHealthOnly) {
      stage.interestingHealthProviderNames = ['Amazon'];
    }

    if (!stage.credentials && $scope.application.defaultCredentials.aws) {
      stage.credentials = $scope.application.defaultCredentials.aws;
    }

    if (stage.isNew) {
      let useAmiBlockDeviceMappings = _.get($scope, 'application.attributes.providerSettings.aws.useAmiBlockDeviceMappings', false);
      stage.useAmiBlockDeviceMappings = useAmiBlockDeviceMappings;
      stage.copySourceCustomBlockDeviceMappings = !useAmiBlockDeviceMappings;
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

    this.toggleSuspendedProcess = (process) => {
      stage.suspendedProcesses = stage.suspendedProcesses || [];
      var processIndex = stage.suspendedProcesses.indexOf(process);
      if (processIndex === -1) {
        stage.suspendedProcesses.push(process);
      } else {
        stage.suspendedProcesses.splice(processIndex, 1);
      }
    };

    this.processIsSuspended = (process) => {
      return stage.suspendedProcesses && stage.suspendedProcesses.includes(process);
    };

    this.getBlockDeviceMappingsSource = () => {
      if (stage.copySourceCustomBlockDeviceMappings) {
        return 'source';
      } else if (stage.useAmiBlockDeviceMappings) {
        return 'ami';
      }
      return 'default';
    };

    this.selectBlockDeviceMappingsSource = (selection) => {
      if (selection === 'source') {
        // copy block device mappings from source asg
        stage.copySourceCustomBlockDeviceMappings = true;
        stage.useAmiBlockDeviceMappings = false;
      } else if (selection === 'ami') {
        // use block device mappings from selected ami
        stage.copySourceCustomBlockDeviceMappings = false;
        stage.useAmiBlockDeviceMappings = true;
      } else {
        // use default block device mappings for selected instance type
        stage.copySourceCustomBlockDeviceMappings = false;
        stage.useAmiBlockDeviceMappings = false;
      }
    };
  });

