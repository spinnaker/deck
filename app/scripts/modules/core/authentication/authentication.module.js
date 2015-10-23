'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.authentication', [
  require('./authentication.service.js'),
  require('../apiHost'),
  require('./authentication.initializer.service.js'),
  require('./authentication.interceptor.service.js')
])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('gateRequestInterceptor');
  })
  .run(function (authenticationInitializer, apiHostProvider) {
    if(apiHostProvider.authEnabled()) {
      authenticationInitializer.authenticateUser();
    }
  })
  .factory('gateRequestInterceptor', function (apiHostProvider) {
    return {
      request: function (config) {
        if (config.url.indexOf(apiHostProvider.baseUrl()) === 0) {
          config.withCredentials = true;
        }
        return config;
      }
    };
  });
