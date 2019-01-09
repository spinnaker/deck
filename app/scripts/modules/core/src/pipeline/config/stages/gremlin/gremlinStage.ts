import { module, IScope } from 'angular';

import { IStage } from 'core/domain';
import { Registry } from 'core/registry';

import { ExecutionDetailsTasks } from '../core';
import { GremlinExecutionDetails } from '../gremlin/GremlinExecutionDetails';

export const GREMLIN_STAGE = 'spinnaker.core.pipeline.stage.gremlinStage';
module(GREMLIN_STAGE, [])
  .config(() => {
    Registry.pipeline.registerStage({
      label: 'Gremlin',
      description: 'Runs a chaos experiment using Gremlin',
      key: 'gremlin',
      controller: 'GremlinStageCtrl',
      controllerAs: 'gremlinStageCtrl',
      templateUrl: require('./gremlinStage.html'),
      executionDetailsSections: [GremlinExecutionDetails, ExecutionDetailsTasks],
      strategy: true,
      validators: [
        { type: 'requiredField', fieldName: 'gremlinCommandTemplateId' },
        { type: 'requiredField', fieldName: 'gremlinTargetTemplateId' },
        { type: 'requiredField', fieldName: 'gremlinApiKey' },
      ],
    });
  })
  .controller('GremlinStageCtrl', function($scope: IScope, stage: IStage) {
    $scope.stage = stage;
    $scope.stage.failPipeline = $scope.stage.failPipeline === undefined ? true : $scope.stage.failPipeline;
    $scope.stage.waitForCompletion =
      $scope.stage.waitForCompletion === undefined ? true : $scope.stage.waitForCompletion;

    $scope.viewState = {
      loading: false,
    };
  });
