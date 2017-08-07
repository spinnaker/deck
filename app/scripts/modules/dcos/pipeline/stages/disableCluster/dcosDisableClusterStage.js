'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.dcos.pipeline.stage.disableClusterStage', [])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'disableCluster',
      cloudProvider: 'dcos',
      templateUrl: require('./disableClusterStage.html'),
      executionDetailsUrl: require('./disableClusterExecutionDetails.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'remainingEnabledServerGroups', fieldLabel: 'Keep [X] enabled Server Groups'},
        { type: 'requiredField', fieldName: 'regions', },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'},
      ],
    });
  }).controller('dcosDisableClusterStageCtrl', function($scope, accountService) {
    var ctrl = this;

    let stage = $scope.stage;

    $scope.state = {
      accounts: false,
      regionsLoaded: false
    };

    accountService.listAccounts('dcos').then(function (accounts) {
      $scope.accounts = accounts;
      $scope.state.accounts = true;
    });

    ctrl.reset = () => {
      ctrl.accountUpdated();
      ctrl.resetSelectedCluster();
    };

    stage.regions = stage.regions || [];
    stage.cloudProvider = 'dcos';

    if (!stage.credentials && $scope.application.defaultCredentials.dcos) {
      stage.credentials = $scope.application.defaultCredentials.dcos;
    }
    if (!stage.regions.length && $scope.application.defaultRegions.dcos) {
      stage.regions.push($scope.application.defaultRegions.dcos);
    }

    if (stage.remainingEnabledServerGroups === undefined) {
      stage.remainingEnabledServerGroups = 1;
    }

    ctrl.pluralize = function(str, val) {
      if (val === 1) {
        return str;
      }
      return str + 's';
    };

    if (stage.preferLargerOverNewer === undefined) {
      stage.preferLargerOverNewer = 'false';
    }
    stage.preferLargerOverNewer = stage.preferLargerOverNewer.toString();
  });
