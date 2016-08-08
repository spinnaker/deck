'use strict';

let angular = require('angular');

// controllerAs: loadBalancerFilters

module.exports = angular.module('spinnaker.core.loadBalancer.filter.controller', [
  require('./loadBalancer.filter.service.js'),
  require('./loadBalancer.filter.model.js'),
  require('../../utils/lodash.js'),
  require('../../filterModel/dependentFilter/dependentFilter.service.js')
])
  .controller('LoadBalancerFilterCtrl', function ($scope, app, _, $log, loadBalancerFilterService,
                                                  LoadBalancerFilterModel, $rootScope, dependentFilterService) {

    $scope.application = app;
    $scope.sortFilter = LoadBalancerFilterModel.sortFilter;

    var ctrl = this;

    this.updateLoadBalancerGroups = () => {
      let { availabilityZone, region, account } = dependentFilterService.digestDependentFilters({
        sortFilter: LoadBalancerFilterModel.sortFilter,
        dependencies: [
          { child: 'account', parent: 'providerType', childKeyedByParent: ctrl.accountsKeyedByProvider },
          { child: 'region', parent: 'account', childKeyedByParent: ctrl.regionsKeyedByAccount },
          { child: 'availabilityZone', parent: 'region', childKeyedByParent: ctrl.availabilityZonesKeyedByRegion }
        ]
      });
      ctrl.accountHeadings = account;
      ctrl.regionHeadings = region;
      ctrl.availabilityZoneHeadings = availabilityZone;

      LoadBalancerFilterModel.applyParamsToUrl();
      loadBalancerFilterService.updateLoadBalancerGroups(app);
    };

    function getHeadingsForOption(option) {
      return _.compact(_.uniq(_.pluck(app.loadBalancers.data, option))).sort();
    }

    function clearFilters() {
      loadBalancerFilterService.clearFilters();
      loadBalancerFilterService.updateLoadBalancerGroups(app);
      ctrl.updateLoadBalancerGroups();
    }

    function getAKeyedByB(a, b) {
      return _(app.loadBalancers.data)
        .groupBy(b)
        .mapValues((loadBalancers) => _(loadBalancers).pluck(a).uniq().valueOf())
        .valueOf();
    }

    function getAvailabilityZonesKeyedByRegion() {
      return _(app.loadBalancers.data)
        .groupBy('region')
        .mapValues((loadBalancers) => {
          return _([ 'instances', 'detachedInstances' ])
            .map((instanceStatus) => {
              return _(loadBalancers)
                .pluck(instanceStatus)
                .flatten()
                .pluck('zone')
                .compact()
                .uniq()
                .valueOf();
            })
            .flatten()
            .valueOf();
        })
        .valueOf();
    }

    this.initialize = function() {
      ctrl.accountsKeyedByProvider = getAKeyedByB('account', 'type');
      ctrl.regionsKeyedByAccount = getAKeyedByB('region', 'account');
      ctrl.availabilityZonesKeyedByRegion = getAvailabilityZonesKeyedByRegion();
      ctrl.stackHeadings = ['(none)'].concat(getHeadingsForOption('stack'));
      ctrl.providerTypeHeadings = getHeadingsForOption('type');
      ctrl.clearFilters = clearFilters;
      ctrl.updateLoadBalancerGroups();
    };

    if (app.loadBalancers.loaded) {
      this.initialize();
    }

    app.loadBalancers.onRefresh($scope, this.initialize);

    $scope.$on('$destroy', $rootScope.$on('$locationChangeSuccess', () => {
      LoadBalancerFilterModel.activate();
      loadBalancerFilterService.updateLoadBalancerGroups(app);
    }));
  }
);
