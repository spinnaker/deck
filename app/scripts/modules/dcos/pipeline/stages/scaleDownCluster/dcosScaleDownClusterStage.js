'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.dcos.pipeline.stage.scaleDownClusterStage', [])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'scaleDownCluster',
      cloudProvider: 'dcos',
      templateUrl: require('./scaleDownClusterStage.html'),
      executionDetailsUrl: require('./scaleDownClusterExecutionDetails.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'remainingFullSizeServerGroups', fieldLabel: 'Keep [X] full size Server Groups'},
        { type: 'requiredField', fieldName: 'regions', },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'},
      ],
      strategy: true,
    });
  }).controller('dcosScaleDownClusterStageCtrl', function($scope, accountService) {
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

    stage.regions = stage.regions || [];
    stage.cloudProvider = 'dcos';

    if (!stage.credentials && $scope.application.defaultCredentials.dcos) {
      stage.credentials = $scope.application.defaultCredentials.dcos;
    }
    if (!stage.regions.length && $scope.application.defaultRegions.dcos) {
      stage.regions.push($scope.application.defaultRegions.dcos);
    }

    if (stage.remainingFullSizeServerGroups === undefined) {
      stage.remainingFullSizeServerGroups = 1;
    }

    if (stage.allowScaleDownActive === undefined) {
      stage.allowScaleDownActive = false;
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

