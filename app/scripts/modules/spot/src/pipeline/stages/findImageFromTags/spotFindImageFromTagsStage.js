'use strict';

import { module } from 'angular';

import { AccountService, AppListExtractor, BakeryReader, Registry } from '@spinnaker/core';

export const SPOT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_SPOTFINDIMAGEFROMTAGSSTAGE =
  'spinnaker.spot.pipeline.stage.findImageFromTagsStage';
export const name = SPOT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_SPOTFINDIMAGEFROMTAGSSTAGE; // for backwards compatibility
module(SPOT_PIPELINE_STAGES_FINDIMAGEFROMTAGS_SPOTFINDIMAGEFROMTAGSSTAGE, [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'findImageFromTags',
      cloudProvider: 'spot',
      templateUrl: require('./findImageFromTagsStage.html'),
      executionDetailsUrl: require('./findImageFromTagsExecutionDetails.html'),
      executionConfigSections: ['findImageConfig', 'taskStatus'],
      validators: [
        {
          type: 'requiredField',
          fieldName: 'packageName',
        },
        {
          type: 'requiredField',
          fieldName: 'regions',
        },
        {
          type: 'requiredField',
          fieldName: 'tags',
        },
      ],
    });
  })
  .controller('spotFindImageFromTagsStageCtrl', [
    '$scope',
    function($scope) {
      $scope.stage.tags = $scope.stage.tags || {};
      $scope.stage.cloudProvider = $scope.stage.cloudProvider || 'spot';

      $scope.stage.regions = AppListExtractor.getRegions([$scope.application]) || [];
      $scope.regions = AppListExtractor.getRegions([$scope.application]) || [];
    },
  ]);
