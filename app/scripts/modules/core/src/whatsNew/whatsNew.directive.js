'use strict';

const angular = require('angular');

import { HtmlRenderer, Parser } from 'commonmark';

import { VIEW_STATE_CACHE_SERVICE } from 'core/cache/viewStateCache.service';
import { TIME_FORMATTERS } from 'core/utils/timeFormatters';
import { WHATS_NEW_READ_SERVICE } from './whatsNew.read.service';

import './whatsNew.less';

module.exports = angular
  .module('spinnaker.core.whatsNew.directive', [
    VIEW_STATE_CACHE_SERVICE,
    WHATS_NEW_READ_SERVICE,
    TIME_FORMATTERS,
  ])
  .directive('whatsNew', function (whatsNewReader, viewStateCache) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: require('./whatsNew.directive.html'),
      controller: function($scope, $uibModal) {
        const parser = new Parser();
        const renderer = new HtmlRenderer();

        // single cache, so we will use the cache name as the key, also
        var cacheId = 'whatsNew';

        var whatsNewViewStateCache = viewStateCache[cacheId] || viewStateCache.createCache(cacheId, { version: 1 });

        $scope.viewState = whatsNewViewStateCache.get(cacheId) || {
          updateLastViewed: null,
        };

        whatsNewReader.getWhatsNewContents().then(function(result) {
          if (result) {
            $scope.fileContents = renderer.render(parser.parse(result.contents));
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
