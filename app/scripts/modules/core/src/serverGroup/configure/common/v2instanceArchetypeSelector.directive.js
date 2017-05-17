'use strict';

import _ from 'lodash';

import {CLOUD_PROVIDER_REGISTRY} from 'core/cloudProvider/cloudProvider.registry';
import {V2_MODAL_WIZARD_SERVICE} from 'core/modal/wizard/v2modalWizard.service';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.serverGroup.configure.common.v2instanceArchetypeSelector', [
  require('./costFactor.js'),
  require('../../../presentation/isVisible/isVisible.directive.js'),
  V2_MODAL_WIZARD_SERVICE,
  CLOUD_PROVIDER_REGISTRY,
])
  .directive('v2InstanceArchetypeSelector', function() {
    return {
      restrict: 'E',
      scope: {
        command: '=',
      },
      templateUrl: require('./v2instanceArchetype.directive.html'),
      controller: 'v2InstanceArchetypeSelectorCtrl',
      controllerAs: 'instanceArchetypeCtrl'
    };
  })
  .controller('v2InstanceArchetypeSelectorCtrl', function($scope, instanceTypeService, infrastructureCaches,
                                                        serverGroupConfigurationService,
                                                        v2modalWizardService, $log, cloudProviderRegistry) {
    var controller = this;
    instanceTypeService.getCategories($scope.command.selectedProvider).then(function(categories) {
      $scope.instanceProfiles = categories;
      if ($scope.instanceProfiles.length % 3 === 0) {
        $scope.columns = 3;
      }
      if ($scope.instanceProfiles.length % 4 === 0) {
        $scope.columns = 4;
      }
      if ($scope.instanceProfiles.length % 5 === 0 || $scope.instanceProfiles.length === 7) {
        $scope.columns = 5;
      }
      controller.selectInstanceType($scope.command.viewState.instanceProfile);
    });

    this.selectInstanceType = function (type) {
      if ($scope.selectedInstanceProfile && $scope.selectedInstanceProfile.type === type) {
        type = null;
        $scope.selectedInstanceProfile = null;
      }
      $scope.command.viewState.instanceProfile = type;
      $scope.instanceProfiles.forEach(function(profile) {
        if (profile.type === type) {
          $scope.selectedInstanceProfile = profile;
          let current = $scope.command.instanceType;
          if (current && !_.includes(['custom', 'buildCustom'], profile.type)) {
            let found = profile.families
              .some((family) => family.instanceTypes.
                some((instanceType) => instanceType.name === current && !instanceType.unavailable)
            );
            if (!found) {
              $scope.command.instanceType = null;
            }
          }
        }
      });
    };

    this.updateInstanceType = () => {
      if ($scope.command.instanceType) {
        v2modalWizardService.markComplete('instance-type');
      } else {
        v2modalWizardService.markIncomplete('instance-type');
      }
    };

    $scope.$watch('command.instanceType', this.updateInstanceType);

    this.updateInstanceTypeDetails = () => {
      instanceTypeService.getInstanceTypeDetails($scope.command.selectedProvider, $scope.command.instanceType).then(function(instanceTypeDetails) {
        $scope.command.viewState.instanceTypeDetails = instanceTypeDetails;
      });
    };

    if ($scope.command.region && $scope.command.instanceType && !$scope.command.viewState.instanceProfile) {
      this.selectInstanceType('custom');
    }

    let setInstanceTypeRefreshTime = () => {
      this.refreshTime = infrastructureCaches.get('instanceTypes').getStats().ageMax;
    };

    this.refreshInstanceTypes = function() {
      controller.refreshing = true;
      serverGroupConfigurationService.refreshInstanceTypes($scope.command.selectedProvider, $scope.command).then(function() {
        setInstanceTypeRefreshTime();
        controller.refreshing = false;
      });
    };

    // if there are no instance types in the cache, try to reload them
    instanceTypeService.getAllTypesByRegion($scope.command.selectedProvider).then(function(results) {
      if (!results || !Object.keys(results).length) {
        controller.refreshInstanceTypes();
      }
    });

    setInstanceTypeRefreshTime();

    this.getInstanceBuilderTemplate = cloudProviderRegistry
      .getValue
      .bind(cloudProviderRegistry,
        $scope.command.cloudProvider,
        'instance.customInstanceBuilderTemplateUrl');

  });
