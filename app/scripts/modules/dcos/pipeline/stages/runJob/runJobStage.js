'use strict';

import _ from 'lodash';

const angular = require('angular');

import { DcosProviderSettings } from '../../../dcos.settings';

module.exports = angular.module('spinnaker.dcos.pipeline.stage.runJobStage', [
  require('dcos/job/general.component.js'),
  //TODO Add back when scheduled jobs are supported better by Spinnaker
  //require('dcos/job/schedule.component.js'),
  require('dcos/job/labels.component.js')
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'runJob',
      cloudProvider: 'dcos',
      templateUrl: require('./runJobStage.html'),
      executionDetailsUrl: require('./runJobExecutionDetails.html'),
      validators: [
        { type: 'requiredField', fieldName: 'account' },
        { type: 'requiredField', fieldName: 'general.id' }
      ]
    });
  }).controller('dcosRunJobStageCtrl', function($scope, accountService, $q) {
    let stage = $scope.stage;
    this.stage = $scope.stage;

    if (!_.has(stage, 'name')) {
      _.set(stage, 'name', Date.now().toString());
    }

    stage.cloudProvider = 'dcos';
    stage.application = $scope.application.name;

    if (!stage.credentials && $scope.application.defaultCredentials.dcos) {
      stage.credentials = $scope.application.defaultCredentials.dcos;
    }

    this.accountChanged = () => {
      setRegistry();
      this.updateRegions();
    };

    this.regionChanged = () => {
    };

    this.updateRegions = () => {
      if (stage.account) {
        $scope.stage.dcosClusters = $scope.backingData.credentialsKeyedByAccount[stage.account].dcosClusters;
        if ($scope.stage.dcosClusters.map(r => r.name).every(r => r !== stage.region)) {
          this.regionChanged();
          delete stage.region;
        }
      } else {
        $scope.stage.dcosClusters = null;
      }
    };

    this.onChange = (changes) => {
      stage.docker.image.registry = changes.registry;
    };

    function attemptToSetValidAccount(accountsByName, stage) {
      var defaultAccount = DcosProviderSettings.defaults.account;
      var dcosAccountNames = _.keys(accountsByName);
      var firstDcosAccount = null;
      if (dcosAccountNames.length) {
        firstDcosAccount = dcosAccountNames[0];
      }

      var defaultAccountIsValid = defaultAccount && dcosAccountNames.includes(defaultAccount);

      stage.account =
        defaultAccountIsValid ? defaultAccount : (firstDcosAccount ? firstDcosAccount : 'my-dcos-account');

      attemptToSetValidDcosCluster(accountsByName, stage);
    }

    function attemptToSetValidDcosCluster(dcosAccountsByName, stage) {
      var defaultDcosCluster = DcosProviderSettings.defaults.dcosCluster;
      var selectedAccount = dcosAccountsByName[stage.account];

      if (selectedAccount) {
        var clusterNames = _.map(selectedAccount.dcosClusters, 'name');
        var defaultDcosClusterIsValid = defaultDcosCluster && clusterNames.includes(defaultDcosCluster);
        stage.dcosCluster = defaultDcosClusterIsValid ? defaultDcosCluster : (clusterNames.length == 1 ? clusterNames[0] : null);
        stage.region = stage.dcosCluster;
      }
    }

    function setRegistry() {
      if (stage.account) {
        _.set(stage, 'docker.image.registry', $scope.backingData.credentialsKeyedByAccount[stage.account].dockerRegistries[0].accountName);
      }
    }

    $q.all({
      credentialsKeyedByAccount: accountService.getCredentialsKeyedByAccount('dcos'),
    }).then((backingData) => {
      backingData.accounts = Object.keys(backingData.credentialsKeyedByAccount);
      $scope.backingData = backingData;

      if (!stage.account) {
        attemptToSetValidAccount(backingData.credentialsKeyedByAccount, stage);
      }

      setRegistry();
      this.updateRegions();
    });

  });
