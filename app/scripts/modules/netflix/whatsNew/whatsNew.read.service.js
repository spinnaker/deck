'use strict';

/*jshint camelcase: false */
let angular = require('angular');

module.exports = angular.module('spinnaker.netflix.whatsNew.read.service', [
  require('../../core/cache/deckCacheFactory.js'),
  require('../../core/config/settings.js')
])
  .constant('whatsNewConfiguration', {
    gistId: '32526cd608db3d811b38',
    fileName: 'news.md',
  })
  .factory('whatsNewReader', function ($http, settings, $log, whatsNewConfiguration) {
    function extractFileContent(data) {
      return data.files[whatsNewConfiguration.fileName].content;
    }

    function getWhatsNewContents() {
      var gistId = whatsNewConfiguration.gistId,
          accessToken = whatsNewConfiguration.accessToken || null,
        url = ['https://api.github.com/gists/', gistId].join('');
      if (accessToken) {
        url += '?access_token=' + accessToken;
      }
      return $http.get(url)
        .then(
          function (result) {
            return {
              contents: extractFileContent(result.data),
              lastUpdated: result.data.updated_at,
            };
          },
          function(failure) {
            $log.warn('failed to retrieve gist for what\'s new dialog:', failure);
            return null;
          });
    }

    return {
      getWhatsNewContents: getWhatsNewContents,
    };
  });
