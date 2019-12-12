'use strict';

import { module } from 'angular';
import _ from 'lodash';

import { ClusterState, UrlBuilder } from '@spinnaker/core';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

export const TITUS_PIPELINE_STAGES_CLONESERVERGROUP_CLONESERVERGROUPEXECUTIONDETAILS_CONTROLLER =
  'spinnaker.titus.pipeline.stage.cloneServerGroup.executionDetails.controller';
export const name = TITUS_PIPELINE_STAGES_CLONESERVERGROUP_CLONESERVERGROUPEXECUTIONDETAILS_CONTROLLER; // for backwards compatibility
module(TITUS_PIPELINE_STAGES_CLONESERVERGROUP_CLONESERVERGROUPEXECUTIONDETAILS_CONTROLLER, [
  UIROUTER_ANGULARJS,
]).controller('titusCloneServerGroupExecutionDetailsCtrl', [
  '$scope',
  '$stateParams',
  'executionDetailsSectionService',
  function($scope, $stateParams, executionDetailsSectionService) {
    $scope.configSections = ['cloneServerGroupConfig', 'taskStatus'];

    let initialized = () => {
      const resultObjects = context['kato.tasks'][0].resultObjects;
      $scope.detailsSection = $stateParams.details;

      let context = $scope.stage.context || {};
      let results = [];

      function addDeployedArtifacts(key) {
        let deployedArtifacts = _.find(resultObjects, key);
        if (deployedArtifacts) {
          _.forEach(deployedArtifacts[key], serverGroupNameAndRegion => {
            if (serverGroupNameAndRegion.includes(':')) {
              let [region, serverGroupName] = serverGroupNameAndRegion.split(':');
              let result = {
                type: 'serverGroups',
                application: context.application,
                serverGroup: serverGroupName,
                account: context.credentials,
                region: region,
                provider: 'titus',
                project: $stateParams.project,
              };
              result.href = UrlBuilder.buildFromMetadata(result);
              results.push(result);
            }
          });
        }
      }

      if (context && context['kato.tasks'] && context['kato.tasks'].length) {
        if (resultObjects && resultObjects.length) {
          addDeployedArtifacts('serverGroupNames');
        }
      }
      $scope.deployed = results;
    };

    this.overrideFiltersForUrl = r => ClusterState.filterService.overrideFiltersForUrl(r);

    let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

    initialize();

    $scope.$on('$stateChangeSuccess', initialize);
  },
]);
