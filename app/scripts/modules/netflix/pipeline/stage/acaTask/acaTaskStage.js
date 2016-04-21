'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.pipeline.stage.genericCanaryStage', [
  require('../../../../core/application/listExtractor/listExtractor.service'),
  require('../../../../core/serverGroup/configure/common/serverGroupCommandBuilder.js'),
  require('../../../../core/cloudProvider/cloudProvider.registry.js'),
  require('../../../../core/config/settings.js'),
  require('../../../../core/account/account.service.js'),
])
  .config(function (pipelineConfigProvider, settings) {
    if (settings.feature && settings.feature.netflixMode) {
      pipelineConfigProvider.registerStage({
        label: 'ACA Task',
        description: 'Canary T that run against an existing cluster, asg, or query',
        key: 'acaTask',
        templateUrl: require('./acaTaskStage.html'),
        executionDetailsUrl: require('./acaTaskExecutionDetails.html'),
        executionSummaryUrl: require('./acaTaskExecutionSummary.html'),
        executionLabelTemplateUrl: require('../canary/canaryExecutionLabel.html'),
        controller: 'AcaTaskStageCtrl',
        controllerAs: 'acaTaskStageCtrl',
        validators: [
          {
            type: 'stageBeforeType',
            stageTypes: ['bake', 'findAmi', 'findImage'],
            message: 'You must have a Bake or Find AMI stage before a canary stage.'
          },
        ],
      });
    }
  })
  .controller('AcaTaskStageCtrl', function ($scope, $uibModal, stage, _,
                                           namingService, providerSelectionService,
                                           authenticationService, cloudProviderRegistry,
                                           serverGroupCommandBuilder, awsServerGroupTransformer, accountService, appListExtractorService) {

    var user = authenticationService.getAuthenticatedUser();
    $scope.stage = stage;
    $scope.stage.baseline = $scope.stage.baseline || {};
    $scope.stage.canary = $scope.stage.canary || {};
    $scope.stage.canary.application = $scope.stage.canary.application || $scope.application.name;
    $scope.stage.canary.owner = $scope.stage.canary.owner || (user.authenticated ? user.name : null);
    $scope.stage.canary.watchers = $scope.stage.canary.watchers || [];
    $scope.stage.canary.canaryConfig = $scope.stage.canary.canaryConfig || { name: [$scope.pipeline.name, 'Canary'].join(' - ') };
    $scope.stage.canary.canaryConfig.canaryHealthCheckHandler = Object.assign($scope.stage.canary.canaryConfig.canaryHealthCheckHandler || {}, {'@class':'com.netflix.spinnaker.mine.CanaryResultHealthCheckHandler'});
    $scope.stage.canary.canaryConfig.canaryAnalysisConfig = $scope.stage.canary.canaryConfig.canaryAnalysisConfig || {};
    $scope.stage.canary.canaryConfig.canaryAnalysisConfig.notificationHours = $scope.stage.canary.canaryConfig.canaryAnalysisConfig.notificationHours || [];
    $scope.stage.canary.canaryConfig.canaryAnalysisConfig.useLookback = $scope.stage.canary.canaryConfig.canaryAnalysisConfig.useLookback || false;
    $scope.stage.canary.canaryConfig.canaryAnalysisConfig.lookbackMins = $scope.stage.canary.canaryConfig.canaryAnalysisConfig.lookbackMins || 0;

    $scope.stage.canary.canaryDeployments = $scope.stage.canary.canaryDeployments || [{type: 'query', '@class':'.CanaryTaskDeployment'}];

    $scope.canaryDeployment = $scope.stage.canary.canaryDeployments[0];

    accountService.getUniqueAttributeForAllAccounts('regions')('aws')
      .then( (regions) => {
        $scope.regions = regions.sort();
      });


    accountService.listAccounts('aws').then(function(accounts) {
      $scope.accounts = accounts;
      setClusterList();
    });


    this.notificationHours = $scope.stage.canary.canaryConfig.canaryAnalysisConfig.notificationHours.join(',');

    this.splitNotificationHours = () => {
      var hoursField = this.notificationHours || '';
      $scope.stage.canary.canaryConfig.canaryAnalysisConfig.notificationHours = _.map(hoursField.split(','), function(str) {
        if (!parseInt(str.trim()).isNaN) {
          return parseInt(str.trim());
        }
        return 0;
      });
    };

    this.getRegion = function(cluster) {
      var availabilityZones = cluster.availabilityZones;
      if (availabilityZones) {
        var regions = Object.keys(availabilityZones);
        if (regions && regions.length) {
          return regions[0];
        }
      }
      return 'n/a';
    };

    let clusterFilter = (cluster) => {
      return $scope.stage.baseline.account ? cluster.account === $scope.stage.baseline.account : true;
    };

    let setClusterList = () => {
      $scope.clusterList = appListExtractorService.getClusters([$scope.application], clusterFilter);
    };

    $scope.resetSelectedCluster = () => {
      $scope.stage.baseline.cluster = undefined;
      setClusterList();
    };



    function getClusterName(cluster) {
      return namingService.getClusterName(cluster.application, cluster.stack, cluster.freeFormDetails);
    }

    this.getClusterName = getClusterName;

  });
