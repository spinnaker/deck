'use strict';

import ruleTester from '../utils/ruleTester';
import rule from '../rules/ng-no-require-angularjs';

ruleTester.run('ng-no-require-angularjs', rule, {
  valid: [
    {
      code: `
        import { module } from 'angular';
        module('foo', []);
      `,
    },
  ],

  invalid: [
    {
      errors: [{ message: "Prefer module('foo', []) to angular.module('foo', [])" }],
      code: `
        import angular from 'angular';
        angular.module('foo', []);
      `,
    },
  ],
});
