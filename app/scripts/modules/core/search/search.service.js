'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.search.service', [
  require('../cache/deckCacheFactory.js'),
  require('../apiHost'),
])
  .factory('searchService', function($q, $http, $log, apiHostProvider) {

    var defaultPageSize = 500;

    function getFallbackResults() {
      return { results: [] };
    }

    function search(params) {
      var defaultParams = {
        pageSize: defaultPageSize
      };

      return $http({
        url: apiHostProvider.baseUrl() + '/search',
        params: angular.extend(defaultParams, params)
      })
        .then(
          function(response) {
            return response.data[0] || getFallbackResults();
          },
          function (response) {
            $log.error(response.data, response);
            return getFallbackResults();
          }
        );
    }

    return {
      search: search,
      getFallbackResults: getFallbackResults,
      defaultPageSize: defaultPageSize,
    };
  }).name;
