'use strict';

let angular = require('angular');
let factoryName = 'wizardSubFormValidation';

/**
 * Propagates standard Angular form validation to v2modalWizardService.
 */

module.exports = angular.module('spinnaker.core.modalWizard.subFormValidation.service', [
    require('./v2modalWizard.service.js'),
    require('../../../core/utils/lodash.js'),
  ])
  .factory(factoryName, function(v2modalWizardService, _) {
    let requiredRegisterFields = ['subForm', 'page'];
    let requiredConfigFields = ['scope', 'form'];
    let requiredValidatorFields = ['watchString', 'validator'];
    let validatorRegistry = {};

    function validateParams(options, requiredFields, functionName) {
      let missingFields = requiredFields.filter(f => !(f in options));
      if (missingFields.length > 0) {
        throw new Error(`${factoryName}.${functionName} options missing the following field(s): ${missingFields.join(',')}`);
      }
    }

    function buildWatchString(form, subForm, formKey) {
      return `${form}.${subForm}.${formKey}`;
    }

    this.config = (options) => {
      validateParams(options, requiredConfigFields, 'config');
      validatorRegistry = {};
      angular.extend(this, options);
      return this;
    };

    this.register = (options) => {
      validateParams(options, requiredRegisterFields, 'register');

      let { subForm, page, allowCompletion, validators } = options;
      allowCompletion = angular.isDefined(allowCompletion) ? allowCompletion : true;
      validators = validators || [];

      validators.push({
        watchString: buildWatchString(this.form, subForm, '$valid'),
        validator: subFormIsValid => subFormIsValid
      });

      validatorRegistry[page] = validators.map(v => new Validator(v, this.scope, page, allowCompletion));

      return this;
    };

    this.subFormsAreValid = () => {
      return _.every(validatorRegistry, validatorsForPage => validatorsForPage.every(v => v.state.valid));
    };

    class Validator {
      constructor(validatorOptions, scope, page, allowCompletion) {
        validateParams(validatorOptions, requiredValidatorFields, 'Validator');

        let { watchString, validator } = validatorOptions;
        this.state = { valid : false };
        this.page = page;
        this.allowCompletion = allowCompletion;

        scope.$watch(watchString, (value) => {
          this.state.valid = validator(value);

          if (this.state.valid) {
            this.emitValid();
          } else {
            this.emitInvalid();
          }
        });
      }

      emitValid() {
        if (this.allowCompletion) {
          let pageIsValid = validatorRegistry[this.page]
            .every(v => v.state.valid);

          if (pageIsValid) {
            v2modalWizardService.markComplete(this.page);
          }
        }
      }

      emitInvalid() {
        v2modalWizardService.markIncomplete(this.page);
      }
    }

    return this;
  });
