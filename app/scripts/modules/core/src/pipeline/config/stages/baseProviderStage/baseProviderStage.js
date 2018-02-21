'use strict';

const angular = require('angular');

import { SETTINGS } from 'core/config/settings';

module.exports = angular.module('spinnaker.core.pipeline.stage.baseProviderStage', [
])
  .controller('BaseProviderStageCtrl', function($scope, stage, accountService, pipelineConfig) {

    // Docker Bake is wedged in here because it doesn't really fit our existing cloud provider paradigm
    let dockerBakeEnabled = SETTINGS.feature.dockerBake && stage.type === 'bake';

    $scope.stage = stage;

    $scope.viewState = $scope.viewState || {};
    $scope.viewState.loading = true;

    var stageProviders = pipelineConfig.getProvidersFor(stage.type);

    if (dockerBakeEnabled) {
      stageProviders.push({cloudProvider: 'docker'});
    }

    accountService.listProviders$($scope.application).take(1).subscribe(function (providers) {
      $scope.viewState.loading = false;
      const availableProviders = [];
      stageProviders.forEach(sp => {
        if (sp.cloudProvider && providers.includes(sp.cloudProvider)) {
          // default to the specified cloud provider if the app supports it
          availableProviders.push(sp.cloudProvider);
        } else if (sp.providesFor) {
          availableProviders.push(...sp.providesFor.filter(p => providers.includes(p)));
        }
      });
      if (dockerBakeEnabled) {
        availableProviders.push('docker');
      }
      if (availableProviders.length === 1) {
        $scope.stage.cloudProviderType = availableProviders[0];
      } else if (!$scope.stage.cloudProviderType && $scope.stage.cloudProvider) {
        // This addresses the situation where a pipeline includes a stage from before it was made multi-provider.
        $scope.stage.cloudProviderType = $scope.stage.cloudProvider;
      } else {
        $scope.providers = availableProviders;
      }
    });

    function loadProvider() {
      const stageProvider = (stageProviders || [])
        .find(s => s.cloudProvider === stage.cloudProviderType || (s.providesFor || []).includes(stage.cloudProviderType));
      if (stageProvider) {
        $scope.stage.type = stageProvider.key || $scope.stage.type;
        $scope.providerStageDetailsUrl = stageProvider.templateUrl;
      }
    }

    $scope.$watch('stage.cloudProviderType', loadProvider);

  });

