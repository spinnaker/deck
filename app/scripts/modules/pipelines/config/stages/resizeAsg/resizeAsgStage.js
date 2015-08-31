'use strict';

//BEN_TODO

let angular = require('angular');

module.exports = angular.module('spinnaker.pipelines.stage.resizeAsgStage', [])
  .config(function (pipelineConfigProvider) {
    var awsStage = {
      label: 'Resize Server Group',
      description: 'Resizes a server group',
      key: 'resizeAsg',
      controller: 'ResizeAsgStageCtrl',
      controllerAs: 'resizeAsgStageCtrl',
      templateUrl: require('./resizeAsgStage.html'),
      executionDetailsUrl: require('./resizeAsgExecutionDetails.html'),
      executionStepLabelUrl: require('./resizeAsgStepLabel.html'),
      validators: [
        {
          type: 'targetImpedance',
          message: 'This pipeline will attempt to resize a server group without deploying a new version into the same cluster.'
        },
      ],
    };
    pipelineConfigProvider.registerStage(awsStage);
    var gceStage = angular.copy(awsStage);
    gceStage.key = gceStage.key + '_gce';
    pipelineConfigProvider.registerStage(gceStage);
  }).controller('ResizeAsgStageCtrl', function ($scope, stage, accountService, stageConstants, _) {

    var ctrl = this;

    $scope.stage = stage;

    $scope.state = {
      accounts: false
    };

    accountService.listAccounts().then(function (accounts) {
      $scope.accounts = accounts;
      $scope.state.accounts = true;
      ctrl.accountUpdated();
    });

    // ASGs are regional in AWS, but zonal in GCE.
    $scope.regions = ['us-east-1', 'us-west-1', 'eu-west-1', 'us-west-2'];
    $scope.zones = ['us-central1-a', 'us-central1-b', 'us-central1-c'];
    $scope.regionsAndZonesLoaded = false;

    ctrl.accountUpdated = function () {
      if (!$scope.accounts) {
        return;
      }
      $scope.selectedAccount = _.find($scope.accounts, function (candidate) {
        return candidate.name === stage.credentials;
      });
      accountService.getRegionsForAccount(stage.credentials).then(function (regions) {
        if ($scope.selectedAccount && $scope.selectedAccount.type === 'gce') {
          stage.providerType = 'gce';
          delete $scope.regions;
          $scope.zones = _.flatten(_.map(regions, function (val) {
            return val;
          }));
        } else {
          delete stage.providerType;
          delete $scope.zones;

          $scope.regions = _.map(regions, function (val) {
            return val.name;
          });
        }
        $scope.regionsAndZonesLoaded = true;
      });
    };

    $scope.resizeTargets = stageConstants.targetList;

    $scope.scaleActions = [
      {
        label: 'Scale Up',
        val: 'scale_up',
      },
      {
        label: 'Scale Down',
        val: 'scale_down'
      }
    ];

    $scope.resizeTypes = [
      {
        label: 'Percentage',
        val: 'pct'
      },
      {
        label: 'Incremental',
        val: 'incr'
      },
      {
        label: 'Exact',
        val: 'exact'
      }
    ];

    stage.capacity = stage.capacity || {};
    stage.regions = stage.regions || [];
    stage.target = stage.target || $scope.resizeTargets[0].val;
    stage.action = stage.action || $scope.scaleActions[0].val;
    stage.resizeType = stage.resizeType || $scope.resizeTypes[0].val;

    if (!stage.credentials && $scope.application.defaultCredentials) {
      stage.credentials = $scope.application.defaultCredentials;
    }
    if (!stage.regions.length && $scope.application.defaultRegion) {
      stage.regions.push($scope.application.defaultRegion);
    }

    if (stage.credentials) {
      ctrl.accountUpdated();
    }

    ctrl.updateResizeType = function () {
      stage.capacity = {};
      delete stage.scalePct;
      delete stage.scaleNum;
    };

  })
  .name;

