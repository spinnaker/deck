'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.openstack.appCacheBackedMultiSelectField.directive', [])
  .directive('osAppCacheBackedMultiSelectField', function () {
    return {
      restrict: 'E',
      templateUrl: require('./appCacheBackedMultiSelect.template.html'),
      scope: {
        cacheKey: '@',
        filter: '<?',
        label: '@',
        model: '=',
        onChange: '&',
        required: '<?'
      },
      link: function(scope) {
        var app = scope.$parent.application;
        var cache = app[scope.cacheKey];

        _.defaults(scope, {
          //wrap selectedOptions to work around issue with ng-model where binding only works if the model is a property of an object
          // (probably fixed in newer versions of AngularJS)
          state: { selectedOptions: scope.model },
          refreshTooltipLabel: scope.label,
          refreshTooltipTemplate: require('./cacheRefresh.tooltip.html'),
          filter: {},
          cache: cache,
          required: false,

          onSelectionsChanged: function() {
            //Hack to work around bug in ui-select where selected values re-appear in the drop-down
            scope.state.selectedOptions = _.uniq(scope.state.selectedOptions);
            scope.model = scope.state.selectedOptions;
            if( scope.onChange ) {
              var args = {};
              args[scope.cacheKey] = scope.model;
              scope.onChange(args);
            }
          }
        });

        function updateOptions() {
          scope.options = _.chain(cache.data)
            .filter(scope.filter)
            .sortBy(function(o) { o.name; })
            .value();
        }

        cache.onRefresh(scope, updateOptions);
        scope.$watch('filter', updateOptions, true);
        scope.$watch('model', function(model) {
          scope.state.selectedOptions = model;
        });

        updateOptions();
      }
    };
});
