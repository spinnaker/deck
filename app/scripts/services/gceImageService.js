'use strict';


angular.module('deckApp')
  .factory('gceImageService', function (settings, $q, Restangular) {

    var gateEndpoint = Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(settings.gateUrl);
    });

    function findImages(query, region, account) {
      return gateEndpoint.all('images/find').getList({account: account, provider: 'gce'}, {}).then(function(results) {
          return results;
        },
        function() {
          return ['ubuntu-1404-trusty-v20141031a', 'debian-7-wheezy-v20141108', 'centos-7-v20141108'];
        });
    }

    // TODO(duftler): Rename getAmi() to getImage()?
    function getAmi(/*amiName, region, credentials*/) {
      // GCE images are not regional so we don't need to retrieve ids scoped to regions.
      return null;
    }

    return {
      findImages: findImages,
      getAmi: getAmi,
    };
  });
