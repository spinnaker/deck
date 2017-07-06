'use strict';

import moment from 'moment';
import _ from 'lodash';

import {CLUSTER_FILTER_SERVICE} from 'core/cluster/filter/clusterFilter.service';
import {CLOUD_PROVIDER_REGISTRY} from 'core/cloudProvider/cloudProvider.registry';
import {EXECUTION_DETAILS_SECTION_SERVICE} from 'core/delivery/details/executionDetailsSection.service';
import {NAMING_SERVICE} from 'core/naming/naming.service';
import {SERVER_GROUP_READER} from 'core/serverGroup/serverGroupReader.service';
import {URL_BUILDER_SERVICE} from 'core/navigation/urlBuilder.service';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.deploy.details.controller', [
  require('@uirouter/angularjs').default,
  CLUSTER_FILTER_SERVICE,
  EXECUTION_DETAILS_SECTION_SERVICE,
  URL_BUILDER_SERVICE,
  CLOUD_PROVIDER_REGISTRY,
  NAMING_SERVICE,
  SERVER_GROUP_READER
])
  .controller('DeployExecutionDetailsCtrl', function ($scope, $stateParams, executionDetailsSectionService,
                                                      urlBuilderService, clusterFilterService, cloudProviderRegistry,
                                                      namingService, serverGroupReader) {

    $scope.configSections = ['deploymentConfig', 'taskStatus'];

    function areJarDiffsEmpty() {
      let result = true;

      const jarDiffs = $scope.stage.context.jarDiffs;
      if (!_.isEmpty(jarDiffs)) {
        result = !Object.keys(jarDiffs).some(key => Array.isArray(jarDiffs[key]) && jarDiffs[key].length);
      }

      return result;
    }

    if ($scope.stage.context) {
      if (($scope.stage.context.commits && $scope.stage.context.commits.length > 0) || !areJarDiffsEmpty($scope.stage.context.jarDiffs)) {
        $scope.configSections.push('changes');
      }
    }

    let initialized = () => {
      $scope.detailsSection = $stateParams.details;

      var context = $scope.stage.context || {},
        results = [];

      function addDeployedArtifacts(key) {
        var deployedArtifacts = _.find(resultObjects, key);
        if (deployedArtifacts) {
          _.forEach(deployedArtifacts[key], function (serverGroupName, region) {
            var result = {
              type: 'serverGroups',
              application: context.application,
              serverGroup: serverGroupName,
              account: context.account,
              region: region,
              provider: context.providerType || context.cloudProvider || 'aws',
              cloudProvider: context.providerType || context.cloudProvider || 'aws',
              project: $stateParams.project,
            };
            result.href = urlBuilderService.buildFromMetadata(result);
            results.push(result);
          });
        }
      }

      if (context && context['kato.tasks'] && context['kato.tasks'].length) {
        var resultObjects = context['kato.tasks'][0].resultObjects;
        if (resultObjects && resultObjects.length) {
          results = [];
          addDeployedArtifacts('serverGroupNameByRegion');
        }
      }
      $scope.deployed = results;
      configureWaitingMessages(results);
      $scope.provider = context.cloudProvider || context.providerType || 'aws';

      $scope.changeConfig = {
        buildInfo: context.buildInfo || {},
        commits: $scope.stage.context.commits,
        jarDiffs: $scope.stage.context.jarDiffs
      };

      if (_.has(context, 'source.region') && context['deploy.server.groups']) {
        const serverGroupName = context['deploy.server.groups'][context.source.region][0];
        serverGroupReader.getServerGroup(context.application, context.account, context.source.region, serverGroupName)
          .then(serverGroup => {
            if (serverGroup.buildInfo.jenkins) {
              $scope.changeConfig.buildInfo.jenkins = serverGroup.buildInfo.jenkins;
            }
          });
      }
    };

    function configureWaitingMessages(deployedArtifacts) {
      $scope.showWaitingMessage = false;
      $scope.waitingForUpInstances = false;
      $scope.showScalingActivitiesLink = false;
      $scope.showPlatformHealthOverrideMessage = false;

      if (!deployedArtifacts.length) {
        return;
      }
      const deployed = deployedArtifacts[0];
      const stage = $scope.stage;

      const activeWaitTask = (stage.tasks || []).find(t => ['RUNNING', 'TERMINAL'].includes(t.status) && t.name === 'waitForUpInstances');

      if (activeWaitTask && stage.context.lastCapacityCheck) {
        $scope.showWaitingMessage = true;
        $scope.waitingForUpInstances = activeWaitTask.status === 'RUNNING';
        const lastCapacity = stage.context.lastCapacityCheck;
        const waitDurationExceeded = activeWaitTask.runningTimeInMs > moment.duration(5, 'minutes').asMilliseconds();
        lastCapacity.total = lastCapacity.up + lastCapacity.down + lastCapacity.outOfService + lastCapacity.unknown + lastCapacity.succeeded + lastCapacity.failed;

        if (cloudProviderRegistry.getValue(stage.context.cloudProvider, 'serverGroup.scalingActivitiesEnabled')) {
          // after three minutes, if desired capacity is less than total number of instances,
          // show the scaling activities link
          if (waitDurationExceeded && lastCapacity.total < stage.context.capacity.desired) {
            $scope.showScalingActivitiesLink = true;
            $scope.scalingActivitiesTarget = {
              name: deployed.serverGroup,
              app: deployed.application,
              account: deployed.account,
              region: deployed.region,
              cluster: namingService.getClusterNameFromServerGroupName(deployed.serverGroup),
              cloudProvider: deployed.cloudProvider,
            };
          }
        }
        // Also show platform health warning after three minutes if instances are in an unknown state
        if (waitDurationExceeded &&
          stage.context.lastCapacityCheck.unknown > 0 &&
          stage.context.lastCapacityCheck.unknown === stage.context.lastCapacityCheck.total &&
          !stage.context.interestingHealthProviderNames &&
          !_.get($scope.application.attributes, 'platformHealthOverride', false)) {
            $scope.showPlatformHealthOverrideMessage = true;
        }
      }
    }

    this.overrideFiltersForUrl = r => clusterFilterService.overrideFiltersForUrl(r);

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);
    if (_.hasIn($scope.application, 'executions.onRefresh')) {
      $scope.application.executions.onRefresh($scope, initialize);
    }

  });
