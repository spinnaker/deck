'use strict';

const angular = require('angular');

import { API, RetryService } from '@spinnaker/core';

module.exports = angular.module('spinnaker.kubernetes.image.reader', []).factory('kubernetesImageReader', function() {
  function findImages(params) {
    return RetryService.buildRetrySequence(
      () => API.all('images/find').getList(params),
      results => results.length > 0,
      10,
      1000,
    ).catch(() => []);
  }

  function getImage(/*amiName, region, account*/) {
    // kubernetes images are not regional so we don't need to retrieve ids scoped to regions.
    return null;
  }

  return {
    findImages: findImages,
    getImage: getImage,
  };
});
