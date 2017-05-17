'use strict';

const angular = require('angular');

import { ACCOUNT_SERVICE } from '@spinnaker/core';

module.exports = angular.module('spinnaker.kubernetes.pipeline.stage.scaleDownClusterStage', [
  ACCOUNT_SERVICE,
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'scaleDownCluster',
      cloudProvider: 'kubernetes',
      templateUrl: require('./scaleDownClusterStage.html'),
      executionDetailsUrl: require('./scaleDownClusterExecutionDetails.html'),
      executionConfigSections: ['scaleDownClusterConfig', 'taskStatus'],
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'remainingFullSizeServerGroups', fieldLabel: 'Keep [X] full size Server Groups'},
        { type: 'requiredField', fieldName: 'namespaces', },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account'},
      ],
      strategy: true,
    });
  }).controller('kubernetesScaleDownClusterStageCtrl', function($scope, accountService) {
    var ctrl = this;

    let stage = $scope.stage;

    $scope.state = {
      accounts: false,
      namespacesLoaded: false
    };

    accountService.listAccounts('kubernetes').then(function (accounts) {
      $scope.accounts = accounts;
      $scope.state.accounts = true;
    });

    stage.namespaces = stage.namespaces || [];
    stage.cloudProvider = 'kubernetes';

    if (!stage.credentials && $scope.application.defaultCredentials.kubernetes) {
      stage.credentials = $scope.application.defaultCredentials.kubernetes;
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

