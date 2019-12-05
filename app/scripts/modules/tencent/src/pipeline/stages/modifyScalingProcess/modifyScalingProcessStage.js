'use strict';

const angular = require('angular');
import { AccountService, Registry, StageConstants } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.tencent.pipeline.stage.modifyScalingProcessStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      label: 'Modify Scaling Process',
      description: 'Suspend/Resume Scaling Processes',
      key: 'modifyTencentScalingProcess',
      alias: 'modifyScalingProcess',
      controller: 'ModifyScalingProcessStageCtrl',
      templateUrl: require('./modifyScalingProcessStage.html'),
      executionDetailsUrl: require('./modifyScalingProcessExecutionDetails.html'),
      executionConfigSections: ['modifyScalingProcessesConfig', 'taskStatus'],
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'action' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'processes' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
      cloudProvider: 'tencent',
      strategy: true,
    });
  })
  .controller('ModifyScalingProcessStageCtrl', [
    '$scope',
    'stage',
    function($scope, stage) {
      $scope.stage = stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('tencent').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      $scope.targets = StageConstants.TARGET_LIST;

      $scope.actions = [
        {
          label: 'Suspend',
          val: 'suspend',
        },
        {
          label: 'Resume',
          val: 'resume',
        },
      ];
      $scope.processes = [
        'Launch',
        'Terminate',
        'AddToLoadBalancer',
        'AlarmNotification',
        'AZRebalance',
        'HealthCheck',
        'ReplaceUnhealthy',
        'ScheduledActions',
      ];

      stage.processes = stage.processes || [];
      stage.regions = stage.regions || [];
      stage.action = stage.action || $scope.actions[0].val;
      stage.target = stage.target || $scope.targets[0].val;
      stage.cloudProvider = 'tencent';

      if (!stage.credentials && $scope.application.defaultCredentials.tencent) {
        stage.credentials = $scope.application.defaultCredentials.tencent;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.tencent) {
        stage.regions.push($scope.application.defaultRegions.tencent);
      }

      $scope.toggleProcess = function(process) {
        if (!stage.processes) {
          stage.processes = [];
        }
        var idx = stage.processes.indexOf(process);
        if (idx > -1) {
          stage.processes.splice(idx, 1);
        } else {
          stage.processes.push(process);
        }
      };

      $scope.$watch('stage.credentials', $scope.accountUpdated);
    },
  ]);
