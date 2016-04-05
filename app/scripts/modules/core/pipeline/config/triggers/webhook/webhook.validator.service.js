'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.trigger.webhook.validation.service', [

  ])
  .factory('webhookValidationService', function(Restangular) {

    function validate(expression) {
    alert(expression);
      return expression.length > 0;
    }

    return {
      validate: validate,
    };
  });

