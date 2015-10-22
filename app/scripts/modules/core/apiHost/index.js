'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.apiHost', [])
  .provider('apiHostProvider', function() {
    let host = null;
    let authEndpoint = null;
    let useHttps = true;
    let authEnabled = false;

    this.$get = function() {
      return {
        setHost(h) {
          host = h;
        },
        setAuthEndpoint(endpoint) {
          authEndpoint = endpoint;
        },
        useHttps(value) {
          useHttps = value;
        },
        host() {
          return host;
        },
        authEndpoint() {
          if (authEndpoint === null) {
            throw("Authentication endpoint has not been set. Set with apiHostProvider#setAuthEndpoint");
          }
          return authEndpoint;
        },
        baseUrl() {
          if (baseUrl === null) {
            throw("API host has not been set. Set with apiHostProvider#setHost");
          }
          return useHttps ? `https://${ host }` : `http://${ host }`;
        },
        authEnabled() {
          return authEnabled;
        },
        enableAuth() {
          authEnabled = true;
        },
        disableAuth() {
          authEnabled = false;
        },
      };
    };
  });