'use strict';

const angular = require('angular');
import { isString, toInteger } from 'lodash';

import {
  CLOUD_PROVIDER_REGISTRY,
  LIST_EXTRACTOR_SERVICE,
  PIPELINE_CONFIG_PROVIDER,
  SERVER_GROUP_COMMAND_BUILDER_SERVICE,
  SETTINGS,
} from '@spinnaker/core';

import { CanaryExecutionLabel } from './CanaryExecutionLabel';
import { CANARY_ANALYSIS_NAME_SELECTOR_COMPONENT } from './canaryAnalysisNameSelector.component';

module.exports = angular.module('spinnaker.canary.canaryStage', [
  LIST_EXTRACTOR_SERVICE,
  CLOUD_PROVIDER_REGISTRY,
  SERVER_GROUP_COMMAND_BUILDER_SERVICE,
  CANARY_ANALYSIS_NAME_SELECTOR_COMPONENT,
  PIPELINE_CONFIG_PROVIDER
])
  .config(function (pipelineConfigProvider) {

    function isExpression(value) {
      return isString(value) && value.includes('${');
    }

    function isValidValue(value, min = 0) {
      let result = false;
      if (isExpression(value) || (!isExpression(value) && (toInteger(value) > min))) {
        result = true;
      }

      return result;
    }

    if (SETTINGS.feature.canary) {

      pipelineConfigProvider.registerStage({
        label: 'Canary',
        description: 'Canary tests new changes against a baseline version',
        extendedDescription: SETTINGS.canaryDocumentationUrl ? `<a target="_blank" href="${SETTINGS.canaryDocumentationUrl}">
          <span class="small glyphicon glyphicon-file"></span> Documentation</a>` : undefined,
        key: 'canary',
        cloudProviders: ['aws'],
        templateUrl: require('./canaryStage.html'),
        executionDetailsUrl: require('./canaryExecutionDetails.html'),
        executionSummaryUrl: require('./canaryExecutionSummary.html'),
        executionLabelComponent: CanaryExecutionLabel,
        stageFilter: (stage) => ['canaryDeployment', 'canary'].includes(stage.type),
        controller: 'CanaryStageCtrl',
        controllerAs: 'canaryStageCtrl',
        accountExtractor: (stage) => (stage.context.clusterPairs || []).map(c => c.baseline.account),
        configAccountExtractor: (stage) => (stage.clusterPairs || []).map(c => c.baseline.account),
        validators: [
          {
            type: 'stageBeforeType',
            stageTypes: ['bake', 'findAmi', 'findImage', 'findImageFromTags'],
            message: 'You must have a Bake or Find AMI stage before a canary stage.'
          },
          {type: 'requiredField', fieldName: 'canary.canaryConfig.lifetimeHours', fieldLabel: 'Canary Lifetime'},
          {type: 'requiredField', fieldName: 'baseline.account', fieldLabel: 'Account'},
          {type: 'requiredField', fieldName: 'baseline.cluster', fieldLabel: 'Cluster'},
          {type: 'requiredField', fieldName: 'clusterPairs', fieldLabel: 'Cluster Pairs'},
          {type: 'requiredField', fieldName: 'canary.canaryConfig.canaryAnalysisConfig.name', fieldLabel: 'Configuration'},
          {type: 'custom', fieldLabel: 'Lookback Duration', validate: (_pipeline, stage) => {
            const cac = stage.canary.canaryConfig.canaryAnalysisConfig,
              useLookback = cac.useLookback,
              lookbackMins = cac.lookbackMins;
            let result = null;
            if (useLookback && !isValidValue(lookbackMins)) {
              result = 'When an analysis type of <strong>Sliding Lookback</strong> is selected, the lookback duration must be positive.';
            }

            return result;
          }},
          {type: 'custom', fieldLabel: 'Report Frequency', validate: (_pipeline, stage) => {
            const reportFrequency = stage.canary.canaryConfig.canaryAnalysisConfig.canaryAnalysisIntervalMins;
            let result = null;
            if (!isValidValue(reportFrequency, 0)) {
              result = 'The <strong>Report Frequency</strong> is required and must be positive.';
            }

            return result;
          }},
          {type: 'custom', fieldLabel: 'Warmup Period', validate: (_pipeline, stage) => {
            const warmup = stage.canary.canaryConfig.canaryAnalysisConfig.beginCanaryAnalysisAfterMins;
            let result = null;
            if (warmup && (isNaN(warmup) || (parseInt(warmup) < 0))) {
              result = 'When a <strong>Warmup Period</strong> is specified, it must be non-negative.';
            }

            return result;
          }},
          {
            type: 'custom', fieldLabel: 'Successful Score', validate: (_pipeline, stage) => {
            const unhealthyScore = stage.canary.canaryConfig.canaryHealthCheckHandler.minimumCanaryResultScore;
            const successfulScore = stage.canary.canaryConfig.canarySuccessCriteria.canaryResultScore;
            let result = null;
            if (!isValidValue(successfulScore) || (!isExpression(unhealthyScore) && (toInteger(unhealthyScore) >= toInteger(successfulScore)))) {
              result = 'The <strong>Successful Score</strong> is required, must be positive, and must be greater than the unhealthy score.';
            }

            return result;
          }},
          {
            type: 'custom', fieldLabel: 'Unhealthy Score', validate: (_pipeline, stage) => {
            const unhealthyScore = stage.canary.canaryConfig.canaryHealthCheckHandler.minimumCanaryResultScore;
            const successfulScore = stage.canary.canaryConfig.canarySuccessCriteria.canaryResultScore;
            let result = null;
            if (!isValidValue(unhealthyScore) || (!isExpression(successfulScore) && (toInteger(unhealthyScore) >= toInteger(successfulScore)))) {
              result = 'The <strong>Unhealthy Score</strong> is required, must be positive, and must be less than the successful score.';
            }

            return result;
          }},
          {
            type: 'custom', validate: (_pipeline, stage) => {
            let result = null;
            if (stage.scaleUp.enabled) {
              const delay = stage.scaleUp.delay;
              if (!isValidValue(delay, -1)) {
                result = 'When a canary scale-up is enabled, the delay value is required and must be non-negative.';
              }
            }

            return result;
          }},
          {
            type: 'custom', validate: (_pipeline, stage) => {
            let result = null;
            if (stage.scaleUp.enabled) {
              const capacity = stage.scaleUp.capacity;
              if (!isValidValue(capacity)) {
                result = 'When a canary scale-up is enabled, the capacity value must be positive.';
              }
            }

            return result;
          }}
        ],
      });
    }
  })
  .controller('CanaryStageCtrl', function ($scope, $uibModal, stage,
                                           namingService, providerSelectionService,
                                           authenticationService, cloudProviderRegistry,
                                           serverGroupCommandBuilder, awsServerGroupTransformer, accountService, appListExtractorService) {

    $scope.isExpression = function(value) {
      return isString(value) && value.includes('${');
    };

    const user = authenticationService.getAuthenticatedUser();
    $scope.stage = stage;
    stage.baseline = stage.baseline || {};
    stage.scaleUp = stage.scaleUp || {enabled: false};

    stage.canary = stage.canary || {};
    stage.canary.owner = stage.canary.owner || (user.authenticated ? user.name : null);
    stage.canary.watchers = stage.canary.watchers || [];

    const cc = stage.canary.canaryConfig;
    if (cc) {
      if (cc.actionsForUnhealthyCanary && cc.actionsForUnhealthyCanary.some(action => action.action === 'TERMINATE')) {
        this.terminateUnhealthyCanaryEnabled = true;
      }

      // ensure string values from canary config are numbers or expressions
      const cac = cc.canaryAnalysisConfig;
      cc.lifetimeHours =
        !$scope.isExpression(cc.lifetimeHours) ? toInteger(cc.lifetimeHours) || undefined : cc.lifetimeHours;
      cac.lookbackMins =
        !$scope.isExpression(cac.lookbackMins) ? toInteger(cac.lookbackMins) || undefined : cac.lookbackMins;
      cac.canaryAnalysisIntervalMins =
        !$scope.isExpression(cac.canaryAnalysisIntervalMins) ? toInteger(cac.canaryAnalysisIntervalMins) || undefined : cac.canaryAnalysisIntervalMins;
      if (stage.scaleUp) {
        stage.scaleUp.delay =
          !$scope.isExpression(stage.scaleUp.delay) ? toInteger(stage.scaleUp.delay) || undefined : stage.scaleUp.delay;
        stage.scaleUp.capacity =
          !$scope.isExpression(stage.scaleUp.capacity) ? toInteger(stage.scaleUp.capacity) || undefined : stage.scaleUp.capacity;
      }

      if (cc.canaryAnalysisConfig.useLookback) {
        this.analysisType = 'SLIDING_LOOKBACK';
      } else {
        this.analysisType = 'GROWING';
      }
    }

    let overriddenCloudProvider = 'aws';
    if ($scope.stage.isNew) {

      // apply defaults
      this.terminateUnhealthyCanaryEnabled = true;
      this.analysisType = 'GROWING';
      stage.canary.canaryConfig = {
        name: [$scope.pipeline.name, 'Canary'].join(' - '),
        lifetimeHours: 3,
        canaryHealthCheckHandler: {
          minimumCanaryResultScore: 75
        },
        canarySuccessCriteria: {
          canaryResultScore: 95
        },
        actionsForUnhealthyCanary: [
          {action: 'DISABLE'},
          {action: 'TERMINATE', delayBeforeActionInMins: 60}
        ],
        canaryAnalysisConfig: {
          combinedCanaryResultStrategy: 'AGGREGATE',
          notificationHours: [1, 2, 3],
          canaryAnalysisIntervalMins: 30,
          useLookback: false,
          lookbackMins: 0,
          beginCanaryAnalysisAfterMins: 0
        }
      };

      accountService.listProviders($scope.application).then(function (providers) {
        if (providers.length === 1) {
          overriddenCloudProvider = providers[0];
        } else if (!$scope.stage.cloudProviderType && $scope.stage.cloudProvider) {
          overriddenCloudProvider = $scope.stage.cloudProvider;
        } else {
          $scope.providers = providers;
        }
      });
    }

    this.recipients = $scope.stage.canary.watchers
      ? angular.isArray($scope.stage.canary.watchers)
        ? $scope.stage.canary.watchers.join(', ')
        : $scope.stage.canary.watchers
      : '';

    this.updateWatchersList = () => {
      if (this.recipients.includes('${')) { //check if SpEL; we don't want to convert to array
        $scope.stage.canary.watchers = this.recipients;
      } else {
        $scope.stage.canary.watchers = [];
        this.recipients.split(',').forEach((email) => {
          $scope.stage.canary.watchers.push(email.trim());
        });
      }
    };

    this.toggleTerminateUnhealthyCanary = function () {
      if (this.terminateUnhealthyCanaryEnabled) {
        $scope.stage.canary.canaryConfig.actionsForUnhealthyCanary = [
          {action: 'DISABLE'},
          {action: 'TERMINATE', delayBeforeActionInMins: 60}
        ];
      } else {
        $scope.stage.canary.canaryConfig.actionsForUnhealthyCanary = [
          {action: 'DISABLE'}
        ];
      }

      return $scope.stage.canary.canaryConfig.actionsForUnhealthyCanary
          .some((action) => action.action === 'TERMINATE');
    };

    this.terminateUnhealthyCanaryMinutes = function (delayBeforeActionInMins) {
      const terminateAction =
        $scope.stage.canary.canaryConfig.actionsForUnhealthyCanary.find((action) => action.action === 'TERMINATE');

      if (delayBeforeActionInMins) {
        terminateAction.delayBeforeActionInMins = delayBeforeActionInMins;
      }

      return terminateAction ? terminateAction.delayBeforeActionInMins : 60;
    };

    let filterServerGroups = () => {
      accountService.listAccounts(this.getCloudProvider()).then(accounts => $scope.accounts = accounts);
      setClusterList();
    };

    $scope.application.serverGroups.ready().then(() => {
      filterServerGroups();
    });

    this.notificationHours = $scope.stage.canary.canaryConfig.canaryAnalysisConfig.notificationHours.join(',');

    this.splitNotificationHours = () => {
      const hoursField = this.notificationHours || '';
      $scope.stage.canary.canaryConfig.canaryAnalysisConfig.notificationHours =
        hoursField.split(',').map((item) => {
          const parsed = parseInt(item.trim());
          if (!isNaN(parsed)) {
            return parsed;
          } else {
            return 0;
          }
        });
    };

    this.getRegion = function(cluster) {
      if (cluster.region) {
        return cluster.region;
      }
      var availabilityZones = cluster.availabilityZones;
      if (availabilityZones) {
        var regions = Object.keys(availabilityZones);
        if (regions && regions.length) {
          return regions[0];
        }
      }
      return 'n/a';
    };

    this.updateLookback = function() {
      $scope.stage.canary.canaryConfig.canaryAnalysisConfig.useLookback = (this.analysisType === 'SLIDING_LOOKBACK');
      if (this.analysisType !== 'SLIDING_LOOKBACK') {
        $scope.stage.canary.canaryConfig.canaryAnalysisConfig.lookbackMins = 0;
      }
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

    let getCloudProvider = () => {
      return $scope.stage.baseline.cloudProvider || overriddenCloudProvider || 'aws';
    };

    this.getCloudProvider = getCloudProvider;

    let resetCloudProvider = () => {
      delete $scope.stage.baseline.cluster;
      delete $scope.stage.baseline.account;
      delete $scope.stage.clusterPairs;
      filterServerGroups();
    };

    if ($scope.stage.isNew) {
      $scope.$watch('stage.baseline.cloudProvider', resetCloudProvider);
    }

    function getClusterName(cluster) {
      return namingService.getClusterName(cluster.application, cluster.stack, cluster.freeFormDetails);
    }

    this.getClusterName = getClusterName;

    function cleanupClusterConfig(cluster, type) {
      delete cluster.credentials;
      if (cluster.freeFormDetails && cluster.freeFormDetails.split('-').pop() === type.toLowerCase()) {
        return;
      }
      if (cluster.freeFormDetails) {
        cluster.freeFormDetails += '-';
      }
      cluster.freeFormDetails += type.toLowerCase();
    }

    function configureServerGroupCommandForEditing(command) {
      command.viewState.disableStrategySelection = true;
      command.viewState.hideClusterNamePreview = true;
      command.viewState.readOnlyFields = { credentials: true, region: true, subnet: true, useSourceCapacity: true };
      delete command.strategy;
    }

    this.addClusterPair = function() {
      $scope.stage.clusterPairs = $scope.stage.clusterPairs || [];
      providerSelectionService.selectProvider($scope.application).then(function(selectedProvider) {
        let config = cloudProviderRegistry.getValue(getCloudProvider(), 'serverGroup');
        $uibModal.open({
          templateUrl: config.cloneServerGroupTemplateUrl,
          controller: `${config.cloneServerGroupController} as ctrl`,
          size: 'lg',
          resolve: {
            title: function () {
              return 'Add Cluster Pair';
            },
            application: function () {
              return $scope.application;
            },
            serverGroupCommand: function () {
              return serverGroupCommandBuilder.buildNewServerGroupCommandForPipeline(selectedProvider)
                .then(function(command) {
                  configureServerGroupCommandForEditing(command);
                  command.viewState.overrides = {
                    capacity: {
                      min: 1, max: 1, desired: 1,
                    },
                    useSourceCapacity: false,
                  };
                  command.viewState.disableNoTemplateSelection = true;
                  command.viewState.customTemplateMessage = 'Select a template to configure the canary and baseline ' +
                    'cluster pair. If you want to configure the server groups differently, you can do so by clicking ' +
                    '"Edit" after adding the pair.';
                  return command;
                });
            },
          }
        }).result.then(function(command) {
          var baselineCluster = awsServerGroupTransformer.convertServerGroupCommandToDeployConfiguration(command),
            canaryCluster = _.cloneDeep(baselineCluster);
          cleanupClusterConfig(baselineCluster, 'baseline');
          cleanupClusterConfig(canaryCluster, 'canary');
          $scope.stage.clusterPairs.push({baseline: baselineCluster, canary: canaryCluster});
        });
      });
    };

    this.editCluster = function(cluster, index, type) {
      cluster.provider = cluster.provider || getCloudProvider() || 'aws';
      let config = cloudProviderRegistry.getValue(cluster.provider, 'serverGroup');
      $uibModal.open({
        templateUrl: config.cloneServerGroupTemplateUrl,
        controller: `${config.cloneServerGroupController} as ctrl`,
        size: 'lg',
        resolve: {
          title: function () {
            return 'Configure ' + type + ' Cluster';
          },
          application: function () {
            return $scope.application;
          },
          serverGroupCommand: function () {
            return serverGroupCommandBuilder.buildServerGroupCommandFromPipeline($scope.application, cluster)
              .then(function(command) {
                configureServerGroupCommandForEditing(command);
                var detailsParts = command.freeFormDetails.split('-');
                var lastPart = detailsParts.pop();
                if (lastPart === type.toLowerCase()) {
                  command.freeFormDetails = detailsParts.join('-');
                }
                return command;
              });
          },
        }
      }).result.then(function(command) {
        var stageCluster = awsServerGroupTransformer.convertServerGroupCommandToDeployConfiguration(command);
        cleanupClusterConfig(stageCluster, type);
        $scope.stage.clusterPairs[index][type.toLowerCase()] = stageCluster;
      });
    };

    this.deleteClusterPair = function(index) {
      $scope.stage.clusterPairs.splice(index, 1);
    };

    this.updateScores = ({ successfulScore, unhealthyScore }) => {
      // Called from a React component.
      $scope.$apply(() => {
        $scope.stage.canary.canaryConfig.canarySuccessCriteria.canaryResultScore = successfulScore;
        $scope.stage.canary.canaryConfig.canaryHealthCheckHandler.minimumCanaryResultScore = unhealthyScore;
      });
    };
  });
