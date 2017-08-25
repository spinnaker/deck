'use strict';

const angular = require('angular');
import _ from 'lodash';

import { AWSProviderSettings } from 'amazon/aws.settings';

import {
  PipelineTemplates,
  BakeExecutionLabel,
  BAKERY_SERVICE,
  PIPELINE_CONFIG_PROVIDER,
  SETTINGS
} from '@spinnaker/core';

module.exports = angular.module('spinnaker.amazon.pipeline.stage.bakeStage', [
  PIPELINE_CONFIG_PROVIDER,
  require('./bakeExecutionDetails.controller.js'),
  BAKERY_SERVICE,
])
  .config(function(pipelineConfigProvider) {
    pipelineConfigProvider.registerStage({
      provides: 'bake',
      cloudProvider: 'aws',
      label: 'Bake',
      description: 'Bakes an image in the specified region',
      templateUrl: require('./bakeStage.html'),
      executionDetailsUrl: require('./bakeExecutionDetails.html'),
      executionLabelComponent: BakeExecutionLabel,
      extraLabelLines: (stage) => {
        return stage.masterStage.context.allPreviouslyBaked || stage.masterStage.context.somePreviouslyBaked ? 1 : 0;
      },
      defaultTimeoutMs: 60 * 60 * 1000, // 60 minutes
      validators: [
        { type: 'requiredField', fieldName: 'package', },
        { type: 'requiredField', fieldName: 'regions', },
        { type: 'stageOrTriggerBeforeType',
          stageTypes: ['jenkins', 'travis'],
          checkParentTriggers: true,
          message: 'Bake stages should always have a Jenkins/Travis stage or trigger preceding them.<br> Otherwise, ' +
        'Spinnaker will bake and deploy the most-recently built package.'}
      ],
      restartable: true,
    });
  })
  .controller('awsBakeStageCtrl', function($scope, bakeryService, $q, authenticationService, $uibModal) {

    $scope.stage.extendedAttributes = $scope.stage.extendedAttributes || {};
    $scope.stage.regions = $scope.stage.regions || [];

    if (!$scope.stage.user) {
      $scope.stage.user = authenticationService.getAuthenticatedUser().name;
    }

    $scope.viewState = {
      loading: true,
      roscoMode: SETTINGS.feature.roscoMode,
      minRootVolumeSize: AWSProviderSettings.minRootVolumeSize,
    };

    function initialize() {
      $q.all({
        regions: bakeryService.getRegions('aws'),
        baseOsOptions: bakeryService.getBaseOsOptions('aws'),
        baseLabelOptions: bakeryService.getBaseLabelOptions(),
        vmTypes: bakeryService.getVmTypes(),
        storeTypes: bakeryService.getStoreTypes(),
      }).then(function(results) {
        $scope.regions = results.regions;
        $scope.vmTypes = results.vmTypes;
        if (!$scope.stage.vmType && $scope.vmTypes && $scope.vmTypes.length) {
          $scope.stage.vmType = $scope.vmTypes[0];
        }
        $scope.storeTypes = results.storeTypes;
        if (!$scope.stage.storeType && $scope.storeTypes && $scope.storeTypes.length) {
          $scope.stage.storeType = $scope.storeTypes[0];
        }
        if ($scope.regions.length === 1) {
          $scope.stage.region = $scope.regions[0];
        } else if (!$scope.regions.includes($scope.stage.region)) {
          delete $scope.stage.region;
        }
        if (!$scope.stage.regions.length && $scope.application.defaultRegions.aws) {
          $scope.stage.regions.push($scope.application.defaultRegions.aws);
        }
        if (!$scope.stage.regions.length && $scope.application.defaultRegions.aws) {
          $scope.stage.regions.push($scope.application.defaultRegions.aws);
        }
        $scope.baseOsOptions = results.baseOsOptions.baseImages;
        $scope.baseLabelOptions = results.baseLabelOptions;

        if (!$scope.stage.baseOs && $scope.baseOsOptions && $scope.baseOsOptions.length) {
          $scope.stage.baseOs = $scope.baseOsOptions[0].id;
        }
        if (!$scope.stage.baseLabel && $scope.baseLabelOptions && $scope.baseLabelOptions.length) {
          $scope.stage.baseLabel = $scope.baseLabelOptions[0];
        }
        $scope.showAdvancedOptions = showAdvanced();
        $scope.viewState.loading = false;
      });
    }

    function deleteEmptyProperties() {
      _.forOwn($scope.stage, function(val, key) {
        if (val === '') {
          delete $scope.stage[key];
        }
      });
    }

    function showAdvanced() {
      const stg = $scope.stage;
      return !!(stg.templateFileName || (stg.extendedAttributes && _.size(stg.extendedAttributes) > 0) ||
        stg.varFileName || stg.baseName || stg.baseAmi || stg.amiName || stg.amiSuffix || stg.rootVolumeSize);
    }

    this.addExtendedAttribute = function() {
      if (!$scope.stage.extendedAttributes) {
           $scope.stage.extendedAttributes = {};
      }
      $uibModal.open({
        templateUrl: PipelineTemplates.addExtendedAttributes,
        controller: 'bakeStageAddExtendedAttributeController',
        controllerAs: 'addExtendedAttribute',
        resolve: {
          extendedAttribute: function () {
            return {
              key: '',
              value: '',
            };
          }
        }
      }).result.then(function(extendedAttribute) {
          $scope.stage.extendedAttributes[extendedAttribute.key] = extendedAttribute.value;
      });
    };

    this.removeExtendedAttribute = function (key) {
      delete $scope.stage.extendedAttributes[key];
    };

    this.showTemplateFileName = function() {
      return $scope.viewState.roscoMode || $scope.stage.templateFileName;
    };

    this.showExtendedAttributes = function() {
      return $scope.viewState.roscoMode || ($scope.stage.extendedAttributes && _.size($scope.stage.extendedAttributes) > 0);
    };

    this.showVarFileName = function() {
      return $scope.viewState.roscoMode || $scope.stage.varFileName;
    };

    $scope.$watch('stage', deleteEmptyProperties, true);

    initialize();
  });
