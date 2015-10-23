'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.featureFlags', [])
  .provider('featureFlagProvider', function() {
    let featureFlags = {};
    this.$get = function() {
      return {
        get(flag) {
          return featureFlags[flag] || false;
        },
        enable(flag) {
          featureFlags[flag] = true;
        },
        disable(flag) {
          featureFlags[flag] = false;
        },
        set(flag, value) {
          featureFlags[flag] = value;
        },
        getAll() {
          return featureFlags;
        },
      };
    };
  });
