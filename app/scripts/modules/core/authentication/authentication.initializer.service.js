'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.authentication.initializer.service', [
  require('../config/settings.js'),
  require('./authentication.service.js'),
])
  .factory('authenticationInitializer', function ($http, $rootScope, redirectService, authenticationService, settings, $location) {

    function authenticateUser() {
      $rootScope.authenticating = true;
      $http.get(settings.authEndpoint)
        .success(function (data) {
          if (data.email) {
            authenticationService.setAuthenticatedUser(data.email);
            $rootScope.authenticating = false;
          } else {
            loginRedirect();
          }
        })
        .error(loginRedirect);
    }

    /**
     * This function hits a protected resource endpoint specifically meant for Deck's
     * login flow.
     */
    function loginRedirect() {
      var callback = encodeURIComponent($location.absUrl());
      redirectService.redirect(settings.gateUrl + '/auth/redirect?to=' + callback);
    }

    return {
      authenticateUser: authenticateUser
    };
  })
  .factory('redirectService', function($window) {
    // this exists so we can spy on the location without actually changing the window location in tests
    return {
      redirect: function(url) {
        $window.location.href = url;
      }
    };
  });
