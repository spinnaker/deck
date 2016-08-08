'use strict';

let angular = require('angular');

// controllerAs: clustersFilters

module.exports = angular.module('cluster', [
  require('./collapsibleFilterSection.directive.js'),
  require('./clusterFilter.service.js'),
  require('./clusterFilter.model.js'),
  require('../../utils/lodash.js'),
  require('../../filterModel/dependentFilter/dependentFilter.service.js'),
])
  .controller('ClusterFilterCtrl', function ($scope, app, _, $log, clusterFilterService,
                                             ClusterFilterModel, $rootScope, dependentFilterService) {

    $scope.application = app;
    $scope.sortFilter = ClusterFilterModel.sortFilter;

    var ctrl = this;

    this.updateClusterGroups = () => {
      let { account, availabilityZone, region } = dependentFilterService.digestDependentFilters({
        sortFilter: ClusterFilterModel.sortFilter,
        dependencies: [
          { child: 'account', parent: 'providerType', childKeyedByParent: ctrl.accountsKeyedByProvider },
          { child: 'region', parent: 'account', childKeyedByParent: ctrl.regionsKeyedByAccount },
          { child: 'availabilityZone', parent: 'region', childKeyedByParent: ctrl.availabilityZonesKeyedByRegion }
        ]
      });

      ctrl.accountHeadings = account;
      ctrl.availabilityZoneHeadings = availabilityZone;
      ctrl.regionHeadings = region;

      ClusterFilterModel.applyParamsToUrl();
      clusterFilterService.updateClusterGroups(app);
    };

    function getHeadingsForOption(option) {
      return _.compact(_.uniq(_.pluck(app.serverGroups.data, option))).sort();
    }

    function clearFilters() {
      clusterFilterService.clearFilters();
      clusterFilterService.updateClusterGroups(app);
      ctrl.updateClusterGroups();
    }

    function getAvailabilityZonesKeyedByRegion() {
      return _(app.serverGroups.data)
        .groupBy('region')
        .mapValues((serverGroups) => _(serverGroups)
          .pluck('instances')
          .flatten()
          .pluck('availabilityZone')
          .uniq()
          .valueOf())
        .valueOf();
    }

    function getAKeyedByB(a,b) {
      return _(app.serverGroups.data)
        .groupBy(b)
        .mapValues((serverGroups) => _(serverGroups)
          .pluck(a).flatten().uniq().valueOf())
        .valueOf();
    }

    this.initialize = function() {
      ctrl.providerTypeHeadings = getHeadingsForOption('type');
      ctrl.accountsKeyedByProvider = getAKeyedByB('account', 'type');
      ctrl.regionsKeyedByAccount = getAKeyedByB('region', 'account');
      ctrl.availabilityZonesKeyedByRegion = getAvailabilityZonesKeyedByRegion();
      ctrl.instanceTypeHeadings = getHeadingsForOption('instanceType');
      ctrl.stackHeadings = ['(none)'].concat(getHeadingsForOption('stack'));
      ctrl.categoryHeadings = getHeadingsForOption('category');
      ctrl.clearFilters = clearFilters;
      $scope.clusters = app.clusters;
      ctrl.updateClusterGroups();
    };


    if (app.serverGroups.loaded) {
      this.initialize();
    }

    app.serverGroups.onRefresh($scope, this.initialize);

    $scope.$on('$destroy', $rootScope.$on('$locationChangeSuccess', () => {
      ClusterFilterModel.activate();
      clusterFilterService.updateClusterGroups(app);
    }));
  }
);
