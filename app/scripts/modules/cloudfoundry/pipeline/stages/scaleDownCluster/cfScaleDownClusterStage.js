'use strict';

const angular = require('angular');

import { AccountService, Registry } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.cf.pipeline.stage.scaleDownClusterStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'scaleDownCluster',
      cloudProvider: 'cf',
      templateUrl: require('./scaleDownClusterStage.html'),
      accountExtractor: stage => [stage.context.credentials],
      configAccountExtractor: stage => [stage.credentials],
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        {
          type: 'requiredField',
          fieldName: 'remainingFullSizeServerGroups',
          fieldLabel: 'Keep [X] full size Server Groups',
        },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
      strategy: true,
    });
  })
  .controller('cfScaleDownClusterStageCtrl', function($scope) {
    var ctrl = this;

    let stage = $scope.stage;

    $scope.state = {
      accounts: false,
    };

    AccountService.listAccounts('cf').then(function(accounts) {
      $scope.accounts = accounts;
      $scope.state.accounts = true;
    });

    $scope.regions = { 'us-central1': ['us-central1-a', 'us-central1-b', 'us-central1-c'] };

    ctrl.accountUpdated = function() {
      AccountService.getAccountDetails(stage.credentials).then(function(details) {
        stage.regions = [details.org];
      });
    };

    stage.regions = stage.regions || [];
    stage.cloudProvider = 'cf';

    if (!stage.credentials && $scope.application.defaultCredentials.cf) {
      stage.credentials = $scope.application.defaultCredentials.cf;
    }

    if (stage.credentials) {
      ctrl.accountUpdated();
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

    $scope.$watch('stage.credentials', $scope.accountUpdated);
  });
