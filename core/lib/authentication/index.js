'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.authentication', [
  require('./service'),
  require('../config'),
  require('./service'),
  require('./interceptor'),
])
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('gateRequestInterceptor');
  })
  .run(function (authenticationInitializer, settings) {
    if(settings.authEnabled) {
      authenticationInitializer.authenticateUser();
    }
  })
  .factory('gateRequestInterceptor', function (settings) {
    return {
      request: function (config) {
        if (config.url.indexOf(settings.gateUrl) === 0) {
          config.withCredentials = true;
        }
        return config;
      }
    };
  });
