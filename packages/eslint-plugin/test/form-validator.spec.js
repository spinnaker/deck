'use strict';

const ruleTester = require('../utils/ruleTester');
const rule = require('../rules/form-validator');

ruleTester.run('form-validator', rule, {
  valid: [
    {
      code: `
      var values;
      const validator = new FormValidator();
      validator.validate(values);
      `,
    },
    {
      code: `
      var values, min;
      const validator = new FormValidator();
      validator.field('foo').arrayForEach(validator => {
        validator.field('nested').withValidators(min(1));
      });
      validator.validate(values);
      `,
    },
  ],
  // The fixers for the rules in form-validator cascade.
  // The fix for one check may trigger a fix for a second check.
  // In the test harness, only one fix seems to take effect at a time.
  // Some of the test outputs may be in a partially fixed state
  invalid: [
    {
      code: `
      const validator = new FormValidator(values);
      validator.validateForm();
      `,
      output: `
      const validator = new FormValidator();
      validator.validate(values);
      `,
      errors: [`Migrate from 'new FormValidator(values).validateForm()' to 'new FormValidator().validate(values)'`],
    },
    {
      code: `
      validator.field('foo').required().withValidators();
      `,
      output: `
      validator.field('foo').required();
      `,
      errors: [`remove empty .withValidators() calls`],
    },
    {
      code: `
      validator.field('foo') . withValidators(     ).required();
      `,
      output: `
      validator.field('foo').required();
      `,
      errors: [`remove empty .withValidators() calls`],
    },
    {
      code: `
      validator.field('foo').withValidators(

      ).arrayForEach(validator => {
        validator.field('nested').withValidators(min(1));
      });
      `,
      output: `
      validator.field('foo').arrayForEach(validator => {
        validator.field('nested').withValidators(min(1));
      });
      `,
      errors: [`remove empty .withValidators() calls`],
    },
    {
      code: `
      validator.field('foo').withValidators(
        min(1),
        arrayForEach(validator => {
          validator.field('nested').withValidators(min(1));
        })
      );
      `,
      output: `
      validator.field('foo').withValidators(
        min(1)
      ).arrayForEach(validator => {
          validator.field('nested').withValidators(min(1));
        });
      `,
      errors: [`Migrate from 'validator.withValidators(arrayForEach(v2 => {}) to validator.arrayForEach(v2 => {})`],
    },
    {
      code: `
      validator.field('foo').withValidators(
        min(1),
        validator.arrayForEach(validator => {
          validator.field('nested').withValidators(min(1));
        })
      );
      `,
      output: `
      validator.field('foo').withValidators(
        min(1)
      ).arrayForEach(validator => {
          validator.field('nested').withValidators(min(1));
        });
      `,
      errors: [`Migrate from 'validator.withValidators(arrayForEach(v2 => {}) to validator.arrayForEach(v2 => {})`],
    },
    {
      code: `
      validator.field('foo').withValidators(
        arrayForEach(validator => {
          validator.field('nested').withValidators(min(1));
        })


        , max(2)
      );
      `,
      output: `
      validator.field('foo').withValidators(
         max(2)
      ).arrayForEach(validator => {
          validator.field('nested').withValidators(min(1));
        });
      `,
      errors: [`Migrate from 'validator.withValidators(arrayForEach(v2 => {}) to validator.arrayForEach(v2 => {})`],
    },
    {
      code: `
      validator.field('foo').withValidators(
        min(1),
        arrayForEach(validator => {
          validator.field('nested').withValidators(min(1));
        }), max(2)
      );
      `,
      output: `
      validator.field('foo').withValidators(
        min(1),
         max(2)
      ).arrayForEach(validator => {
          validator.field('nested').withValidators(min(1));
        });
      `,
      errors: [`Migrate from 'validator.withValidators(arrayForEach(v2 => {}) to validator.arrayForEach(v2 => {})`],
    },
    {
      code: `
      validator.field('foo').arrayForEach(validator => {
        validator.item('label').withValidators(min(1));
      });
      `,
      output: `
      validator.field('foo').arrayForEach(path => {
        const validator = new FormValidator(path, 'label');
validator.withValidators(min(1));
return validator;
      });
      `,
      errors: [`Migrate from itemBuilder to path => new FormValidator(path)`],
    },
  ],
});
