'use strict';
let angular = require('angular');

module.exports = angular
  .module('spinnaker.netflix.feedback', [
    require('./feedback.modal.controller.js'),
    require('./feedback.directive.js')
  ])
  .provider('feedbackUrlProvider', function() {
    let feedbackUrl = null;
    this.$get = function() {
      return {
        set(url) {
          feedbackUrl = url;
        },
        get() {
          if (feedbackUrl === null) {
            throw("Feedback url is not set. Set it with feedbackUrlProvider#set");
          }
          return feedbackUrl;
        },
      };
    };
  });
