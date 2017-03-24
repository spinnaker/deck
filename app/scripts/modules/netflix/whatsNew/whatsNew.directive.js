'use strict';

require('./whatsNew.less');

let angular = require('angular');
import {TIME_FILTERS} from 'core/utils/filters';
import {VIEW_STATE_CACHE_SERVICE} from 'core/cache/viewStateCache.service';

module.exports = angular
  .module('spinnaker.netflix.whatsNew.directive', [
    require('angular-marked'),
    VIEW_STATE_CACHE_SERVICE,
    require('./whatsNew.read.service.js'),
    TIME_FILTERS
  ])
  .config(function (markedProvider) {
    markedProvider.setOptions(
      {gfm: true}
    );
  })
  .directive('whatsNew', function (whatsNewReader, viewStateCache) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: require('./whatsNew.directive.html'),
      controller: function($scope, $uibModal) {

        // single cache, so we will use the cache name as the key, also
        var cacheId = 'whatsNew';

        var whatsNewViewStateCache = viewStateCache[cacheId] || viewStateCache.createCache(cacheId, { version: 1 });

        $scope.viewState = whatsNewViewStateCache.get(cacheId) || {
          updateLastViewed: null,
        };

        whatsNewReader.getWhatsNewContents().then(function(result) {
          if (result) {
            $scope.fileContents = result.contents;
            $scope.fileLastUpdated = result.lastUpdated;
            $scope.lastUpdatedDate = new Date(result.lastUpdated).getTime();
          }
        });

        $scope.showWhatsNew = function() {
          $scope.viewState.updateLastViewed = $scope.fileLastUpdated;
          whatsNewViewStateCache.put(cacheId, $scope.viewState);
          $uibModal.open({
            templateUrl: require('./whatsNew.directive.modal.html'),
            scope: $scope,
          });
        };

        $scope.updatesUnread = function() {
          return $scope.fileLastUpdated && $scope.fileLastUpdated !== $scope.viewState.updateLastViewed;
        };

      }
    };
  });
