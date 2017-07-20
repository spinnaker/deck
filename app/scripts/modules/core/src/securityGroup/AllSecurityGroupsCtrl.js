'use strict';

import _ from 'lodash';

import { CLOUD_PROVIDER_REGISTRY } from 'core/cloudProvider/cloudProvider.registry';
import { PROVIDER_SELECTION_SERVICE } from 'core/cloudProvider/providerSelection/providerSelection.service';
import { SETTINGS } from 'core/config/settings';
import { SECURITY_GROUP_FILTER_MODEL } from './filter/securityGroupFilter.model';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.securityGroup.all.controller', [
  require('./filter/securityGroup.filter.service.js'),
  SECURITY_GROUP_FILTER_MODEL,
  PROVIDER_SELECTION_SERVICE,
  require('angular-ui-bootstrap'),
  CLOUD_PROVIDER_REGISTRY,
])
  .controller('AllSecurityGroupsCtrl', function($scope, app, $uibModal, $timeout,
                                                providerSelectionService, cloudProviderRegistry,
                                                securityGroupFilterModel, securityGroupFilterService) {

    this.$onInit = () => {
      const groupsUpdatedSubscription = securityGroupFilterService.groupsUpdatedStream.subscribe(() => groupsUpdated());

      securityGroupFilterModel.activate();

      this.initialized = false;

      $scope.application = app;

      $scope.sortFilter = securityGroupFilterModel.sortFilter;

      handleRefresh();

      app.setActiveState(app.securityGroups);
      $scope.$on('$destroy', () => {
        app.setActiveState();
        groupsUpdatedSubscription.unsubscribe();
      });

      app.securityGroups.ready().then(() => updateSecurityGroups());

      app.securityGroups.onRefresh($scope, handleRefresh);

    };

    this.groupingsTemplate = require('./groupings.html');

    let updateSecurityGroups = () => {
      $scope.$evalAsync(() => {
        securityGroupFilterService.updateSecurityGroups(app);
        groupsUpdated();
        // Timeout because the updateSecurityGroups method is debounced by 25ms
        $timeout(() => { this.initialized = true; }, 50);
      });
    };

    let groupsUpdated = () => {
      $scope.$applyAsync(() => {
        $scope.groups = securityGroupFilterModel.groups;
        $scope.tags = securityGroupFilterModel.tags;
      });
    };

    this.clearFilters = function() {
      securityGroupFilterService.clearFilters();
      updateSecurityGroups();
    };

    this.createSecurityGroup = function createSecurityGroup() {
      providerSelectionService.selectProvider(app, 'securityGroup').then(function(selectedProvider) {
        let provider = cloudProviderRegistry.getValue(selectedProvider, 'securityGroup');
        var defaultCredentials = app.defaultCredentials[selectedProvider] || SETTINGS.providers[selectedProvider].defaults.account,
            defaultRegion = app.defaultRegions[selectedProvider] || SETTINGS.providers[selectedProvider].defaults.region;
        $uibModal.open({
          templateUrl: provider.createSecurityGroupTemplateUrl,
          controller: `${provider.createSecurityGroupController} as ctrl`,
          size: 'lg',
          resolve: {
            securityGroup: function () {
              return {
                credentials: defaultCredentials,
                subnet: 'none',
                regions: [defaultRegion],
                vpcId: null,
                securityGroupIngress: []
              };
            },
            application: function () {
              return app;
            }
          }
        });
      });
    };

    this.updateSecurityGroups = _.debounce(updateSecurityGroups, 200);

    let handleRefresh = () => {
      this.updateSecurityGroups();
    };
  }
);
