'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.loadBalancer.controller', [
  require('angular-ui-bootstrap'),
  require('../cloudProvider/providerSelection/providerSelection.service.js'),
  require('./filter/loadBalancer.filter.service.js'),
  require('./filter/loadBalancer.filter.model.js'),
  require('../utils/lodash.js'),
  require('../cache/deckCacheFactory.js'),
  require('../filterModel/filter.tags.directive.js'),
  require('../cloudProvider/cloudProvider.registry.js'),
])
  .controller('AllLoadBalancersCtrl', function($scope, $uibModal, _, providerSelectionService, cloudProviderRegistry,
                                               LoadBalancerFilterModel, loadBalancerFilterService, app ) {

    LoadBalancerFilterModel.activate();

    $scope.application = app;

    $scope.sortFilter = LoadBalancerFilterModel.sortFilter;

    this.groupingsTemplate = require('./groupings.html');

    function addSearchFields() {
      app.loadBalancers.forEach(function(loadBalancer) {
        if (!loadBalancer.searchField) {
          loadBalancer.searchField = [
            loadBalancer.name,
            loadBalancer.region.toLowerCase(),
            loadBalancer.account,
            _.pluck(loadBalancer.serverGroups, 'name').join(' '),
            _.pluck(loadBalancer.instances, 'id').join(' '),
          ].join(' ');
        }
      });
    }

    this.clearFilters = function() {
      loadBalancerFilterService.clearFilters();
      updateLoadBalancerGroups();
    };

    function updateLoadBalancerGroups() {
      LoadBalancerFilterModel.applyParamsToUrl();
      $scope.$evalAsync(function() {
        loadBalancerFilterService.updateLoadBalancerGroups(app);
        $scope.groups = LoadBalancerFilterModel.groups;
        $scope.tags = LoadBalancerFilterModel.tags;
      });
    }

    this.createLoadBalancer = function createLoadBalancer() {
      providerSelectionService.selectProvider(app).then(function(selectedProvider) {
        let provider = cloudProviderRegistry.getValue(selectedProvider, 'loadBalancer');
        $uibModal.open({
          templateUrl: provider.createLoadBalancerTemplateUrl,
          controller: `${provider.createLoadBalancerController} as ctrl`,
          resolve: {
            application: function() { return app; },
            loadBalancer: function() { return null; },
            isNew: function() { return true; }
          }
        });
      });
    };

    this.updateLoadBalancerGroups = _.debounce(updateLoadBalancerGroups, 200);

    function autoRefreshHandler() {
      addSearchFields();
      updateLoadBalancerGroups();
    }

    autoRefreshHandler();

    app.registerAutoRefreshHandler(autoRefreshHandler, $scope);
  }
);
