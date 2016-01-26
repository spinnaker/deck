'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.aws.disableAsgStage', [
  require('../../../../../application/modal/platformHealthOverride.directive.js'),
  require('../../../../../../core/application/listExtractor/listExtractor.service'),
  require('../../../../../utils/lodash.js'),
  require('../../stageConstants.js'),
  require('./disableAsgExecutionDetails.controller.js')
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'disableServerGroup',
      alias: 'disableAsg',
      cloudProvider: 'aws',
      templateUrl: require('./disableAsgStage.html'),
      executionDetailsUrl: require('./disableAsgExecutionDetails.html'),
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
  }).controller('awsDisableAsgStageCtrl', function($scope, accountService, stageConstants, appListExtractorService, _) {
    var ctrl = this;

    let stage = $scope.stage;

    $scope.state = {
      accounts: false,
      regionsLoaded: false
    };


    let clusterFilter = (cluster) => {
      let acctFilter = $scope.stage.credentials ? cluster.account === $scope.stage.credentials : true;
      let regionFilter = $scope.stage.regions && $scope.stage.regions.length
        ? _.some( cluster.serverGroups, (sg) => _.some($scope.stage.regions, (region) => region === sg.region))
        : true;

      return acctFilter && regionFilter;
    };

    let setClusterList = () => {
      $scope.clusterList = appListExtractorService.getClusters([$scope.application], clusterFilter);
    };

    accountService.listAccounts('aws').then(function (accounts) {
      $scope.accounts = accounts;
      $scope.state.accounts = true;
      setClusterList();
    });

    $scope.resetSelectedCluster = () => {
      $scope.stage.cluster = undefined;
      setClusterList();
    };

    ctrl.accountUpdated = function() {
      let accountFilter = (cluster) => cluster.account === $scope.stage.credentials;
      $scope.regions = appListExtractorService.getRegions([$scope.application], accountFilter);
      $scope.state.regionsLoaded = true;
      $scope.resetSelectedCluster();
    };

    $scope.targets = stageConstants.targetList;

    stage.regions = stage.regions || [];
    stage.cloudProvider = 'aws';

    if (stage.isNew && $scope.application.attributes.platformHealthOnly) {
      stage.interestingHealthProviderNames = ['Amazon'];
    }

    if (!stage.credentials && $scope.application.defaultCredentials.aws) {
      stage.credentials = $scope.application.defaultCredentials.aws;
    }
    if (!stage.regions.length && $scope.application.defaultRegions.aws) {
      stage.regions.push($scope.application.defaultRegions.aws);
    }

    if (stage.credentials) {
      ctrl.accountUpdated();
    }
    if (!stage.target) {
      stage.target = $scope.targets[0].val;
    }

  });

