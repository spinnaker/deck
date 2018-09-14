'use strict';

const angular = require('angular');

import { AccountService, Registry } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.core.pipeline.stage.oracle.shrinkClusterStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'shrinkCluster',
      cloudProvider: 'oracle',
      templateUrl: require('./shrinkClusterStage.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'shrinkToSize', fieldLabel: 'shrink to [X] Server Groups' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('oracleShrinkClusterStageCtrl', function($scope) {
    let ctrl = this;

    let stage = $scope.stage;

    $scope.state = {
      accounts: false,
      regionsLoaded: false,
    };

    AccountService.listAccounts('oracle').then(function(accounts) {
      $scope.accounts = accounts;
      $scope.state.accounts = true;
    });

    stage.regions = stage.regions || [];

    stage.cloudProvider = 'oracle';

    if (!stage.credentials && $scope.application.defaultCredentials.oracle) {
      stage.credentials = $scope.application.defaultCredentials.oracle;
    }

    if (!stage.regions.length && $scope.application.defaultRegions.oracle) {
      stage.regions.push($scope.application.defaultRegions.oracle);
    }

    if (stage.shrinkToSize === undefined) {
      stage.shrinkToSize = 1;
    }

    if (stage.allowDeleteActive === undefined) {
      stage.allowDeleteActive = false;
    }

    ctrl.pluralize = function(str, val) {
      return val === 1 ? str : str + 's';
    };

    if (stage.retainLargerOverNewer === undefined) {
      stage.retainLargerOverNewer = 'false';
    }

    stage.retainLargerOverNewer = stage.retainLargerOverNewer.toString();
  });
