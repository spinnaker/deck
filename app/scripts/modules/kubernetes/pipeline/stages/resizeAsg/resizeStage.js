'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.kubernetes.resizeStage', [
  require('core/application/modal/platformHealthOverride.directive.js'),
  require('core/account/account.service.js'),
  require('./resizeExecutionDetails.controller.js'),
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'resizeServerGroup',
      cloudProvider: 'kubernetes',
      templateUrl: require('./resizeStage.html'),
      executionDetailsUrl: require('./resizeExecutionDetails.html'),
      executionStepLabelUrl: require('./resizeStepLabel.html'),
      validators: [
        {
          type: 'targetImpedance',
          message: 'This pipeline will attempt to resize a server group without deploying a new version into the same cluster.'
        },
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'action' },
        { type: 'requiredField', fieldName: 'namespaces' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'}
      ],
    });
  }).controller('kubernetesResizeStageController', function($scope, accountService, stageConstants) {

    var ctrl = this;

    let stage = $scope.stage;

    $scope.viewState = {
      accountsLoaded: false,
      namespacesLoaded: false
    };

    accountService.listAccounts('kubernetes').then(function (accounts) {
      $scope.accounts = accounts;
      $scope.viewState.accountsLoaded = true;
    });

    $scope.resizeTargets = stageConstants.targetList;

    $scope.scaleActions = [
      {
        label: 'Scale Up',
        val: 'scale_up',
      },
      {
        label: 'Scale Down',
        val: 'scale_down'
      },
      {
        label: 'Scale to Cluster Size',
        val: 'scale_to_cluster'
      },
      {
        label: 'Scale to Exact Size',
        val: 'scale_exact'
      },
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
    ];

    stage.capacity = stage.capacity || {};
    stage.namespaces = stage.namespaces || [];
    stage.target = stage.target || $scope.resizeTargets[0].val;
    stage.action = stage.action || $scope.scaleActions[0].val;
    stage.resizeType = stage.resizeType || $scope.resizeTypes[0].val;
    if (stage.resizeType === 'exact') {
      stage.action = 'scale_exact';
    }
    stage.cloudProvider = 'kubernetes';
    stage.cloudProviderType = 'kubernetes';

    if (stage.isNew && $scope.application.attributes.platformHealthOnly) {
      stage.interestingHealthProviderNames = ['KubernetesPod'];
    }

    if (!stage.credentials && $scope.application.defaultCredentials.kubernetes) {
      stage.credentials = $scope.application.defaultCredentials.kubernetes;
    }

    ctrl.updateResizeType = function() {
      if (stage.action === 'scale_exact') {
        stage.resizeType = 'exact';
        delete stage.scalePct;
        delete stage.scaleNum;
      } else {
        stage.capacity = {};
        if (stage.resizeType === 'pct') {
          delete stage.scaleNum;
        } else if (stage.resizeType === 'incr') {
          delete stage.scalePct;
        }
      }
    };
  });

