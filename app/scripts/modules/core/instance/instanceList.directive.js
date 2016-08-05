'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.instance.instanceList.directive', [
  require('../cluster/filter/clusterFilter.model'),
  require('../cluster/filter/multiselect.model'),
  require('./instanceListBody.directive'),
])
  .directive('instanceList', function (ClusterFilterModel, MultiselectModel) {
    return {
      restrict: 'E',
      templateUrl: require('./instanceList.directive.html'),
      scope: {
        hasDiscovery: '=',
        hasLoadBalancers: '=',
        instances: '=',
        sortFilter: '=',
        serverGroup: '=',
      },
      link: function (scope) {

        let serverGroup = scope.serverGroup;

        let setInstanceGroup = () => {
          scope.instanceGroup = MultiselectModel.getOrCreateInstanceGroup(serverGroup);
        };

        scope.selectAllClicked = (event) => {
          event.stopPropagation(); // prevent navigation; preventDefault would stop the checkbox from being selected
          scope.toggleSelectAll();
        };

        scope.toggleSelectAll = () => {
          MultiselectModel.toggleSelectAll(serverGroup, scope.instances.map((instance) => instance.id));
        };

        scope.applyParamsToUrl = ClusterFilterModel.applyParamsToUrl;
        scope.showProviderHealth = !scope.hasDiscovery && !scope.hasLoadBalancers;

        scope.columnWidth = {
          id: 20,
          launchTime: 23,
          zone: 12,
          discovery: 16,
          loadBalancers: 31,
          cloudProvider: 31,
        };

        if (!scope.hasDiscovery) {
          scope.columnWidth.id += 4;
          scope.columnWidth.launchTime += 4;
          scope.columnWidth.zone += 4;
          scope.columnWidth.loadBalancers += 4;
        }

        setInstanceGroup();

        let multiselectWatcher = MultiselectModel.instancesStream.subscribe(setInstanceGroup);

        scope.$on('$destroy', () => {
          multiselectWatcher.dispose();
        });
      }
    };
  });
