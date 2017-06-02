'use strict';

import {EXECUTION_DETAILS_SECTION_SERVICE} from 'core/delivery/details/executionDetailsSection.service';
import {CLOUD_PROVIDER_REGISTRY} from 'core/cloudProvider/cloudProvider.registry';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.createLoadBalancer.executionDetails.controller', [
  require('@uirouter/angularjs').default,
  EXECUTION_DETAILS_SECTION_SERVICE,
  CLOUD_PROVIDER_REGISTRY,
])
  .controller('createLoadBalancerExecutionDetailsCtrl', function ($scope, $stateParams, cloudProviderRegistry,
                                                                  executionDetailsSectionService) {

    $scope.configSections = ['loadBalancerConfig', 'taskStatus'];

    let initialized = () => {
      $scope.detailsSection = $stateParams.details;

        var context = $scope.stage.context || {},
          results = [];

        function addCreatedArtifacts(key) {
          var createdArtifacts = resultObjects;
          if (createdArtifacts) {
            createdArtifacts.forEach(function (artifact) {
              _.forEach(artifact[key], function (valueObj, key) {
                var result = {
                  type: 'loadBalancers',
                  application: context.application,
                  name: valueObj.name,
                  region: key,
                  account: context.account,
                  dnsName: valueObj.dnsName,
                  provider: context.providerType || context.cloudProvider || 'aws'
                };
                results.push(result);
              });
            });
          }
        }

        if (context && context['kato.tasks'] && context['kato.tasks'].length) {
          var resultObjects = context['kato.tasks'][0].resultObjects;
          if (resultObjects && resultObjects.length) {
            results = [];
            addCreatedArtifacts('loadBalancers');
          }
        }
        $scope.createdLoadBalancers = results;
        $scope.provider = context.cloudProvider || context.providerType || 'aws';
    };

    $scope.hasSubnetDeployments = () => {
      let cloudProvider = $scope.provider || 'aws';
      return cloudProviderRegistry.hasValue(cloudProvider, 'subnet');
    };

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);

  });
