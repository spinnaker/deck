'use strict';

import { module } from 'angular';

import { API } from '@spinnaker/core';

export const AZURE_IMAGE_IMAGE_READER = 'spinnaker.azure.image.reader';
export const name = AZURE_IMAGE_IMAGE_READER; // for backwards compatibility
module(AZURE_IMAGE_IMAGE_READER, []).factory('azureImageReader', function () {
  function findImages(params) {
    return API.path('images', 'find')
      .query(params)
      .get()
      .then(
        function (results) {
          return results;
        },
        function () {
          return [];
        },
      );
  }

  function getImage(amiName, region, credentials) {
    return API.path('images', credentials, region, amiName)
      .query({ provider: 'azure' })
      .get()
      .then(
        function (results) {
          return results && results.length ? results[0] : null;
        },
        function () {
          return null;
        },
      );
  }

  return {
    findImages: findImages,
    getImage: getImage,
  };
});
