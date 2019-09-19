'use strict';

const angular = require('angular');

import { ApplicationNameValidator } from '@spinnaker/core';

export const ALICLOU_VALIDATION = 'spinnaker.alicloud.validation.applicationName';
angular
  .module(ALICLOU_VALIDATION, [])
  .factory('alicloudApplicationNameValidator', function() {
    function validateSpecialCharacters(name: any, errors: any) {
      const pattern = /^([a-zA-Z][a-zA-Z0-9]*)?$/;
      if (!pattern.test(name)) {
        errors.push(
          'The application name must begin with a letter and must contain only letters or digits. No ' +
            'special characters are allowed.',
        );
      }
    }

    function validate(name: any) {
      const warnings: any[] = [],
        errors: any[] = [];

      if (name && name.length) {
        validateSpecialCharacters(name, errors);
      }

      return {
        warnings: warnings,
        errors: errors,
      };
    }

    return {
      validate: validate,
    };
  })
  .run([
    'alicloudApplicationNameValidator',
    function(alicloudApplicationNameValidator: any) {
      ApplicationNameValidator.registerValidator('alicloud', alicloudApplicationNameValidator);
    },
  ]);
