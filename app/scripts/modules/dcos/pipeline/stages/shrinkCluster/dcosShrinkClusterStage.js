'use strict';

const angular = require('angular');

import { PipelineTemplates } from '@spinnaker/core';

module.exports = angular.module('spinnaker.dcos.pipeline.stage.shrinkClusterStage', [
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'shrinkCluster',
      cloudProvider: 'dcos',
      templateUrl: require('./shrinkClusterStage.html'),
      executionDetailsUrl: PipelineTemplates.shrinkClusterExecutionDetails,
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'shrinkToSize', fieldLabel: 'shrink to [X] Server Groups'},
        { type: 'requiredField', fieldName: 'regions', },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'},
      ],
    });
  }).controller('dcosShrinkClusterStageCtrl', function($scope, accountService) {
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

    if (stage.shrinkToSize === undefined) {
      stage.shrinkToSize = 1;
    }

    if (stage.allowDeleteActive === undefined) {
      stage.allowDeleteActive = false;
    }

    ctrl.pluralize = function(str, val) {
      if (val === 1) {
        return str;
      }
      return str + 's';
    };

    if (stage.retainLargerOverNewer === undefined) {
      stage.retainLargerOverNewer = 'false';
    }
    stage.retainLargerOverNewer = stage.retainLargerOverNewer.toString();
  });
