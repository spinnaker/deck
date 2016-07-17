'use strict';

let angular = require('angular');
let factoryName = 'wizardSubFormValidation';

/**
 * Propagates standard Angular form validation to v2modalWizardService.
 */

module.exports = angular.module('spinnaker.core.modalWizard.subFormValidation.service', [
    require('./v2modalWizard.service.js'),
  ])
  .factory(factoryName, function(v2modalWizardService) {
    let requiredRegisterFields = ['subForm', 'page'];
    let requiredConfigFields = ['scope', 'form'];
    let requiredValidatorFields = ['watchString', 'validator'];
    this.validatorRegistry = {};

    function validateFunctionInput(options, requiredFields, functionName) {
      let missingFields = requiredFields.filter(f => !(f in options));
      if (missingFields.length > 0) {
        throw new Error(`${factoryName}.${functionName} options missing the following field(s): ${ missingFields.join(',') }`);
      }
    }

    function buildWatchString(form, subForm, formKey) {
      return `${form}.${subForm}.${formKey}`;
    }

    this.config = (options) => {
      validateFunctionInput(options, requiredConfigFields, 'config');
      angular.extend(this, options);
      return this;
    };

    this.register = (options) => {
      validateFunctionInput(options, requiredRegisterFields, 'register');

      let { subForm, page, allowCompletion, validators } = options;
      allowCompletion = angular.isDefined(allowCompletion) ? allowCompletion : true;
      validators = validators || [];

      validators.push({
        watchString: buildWatchString(this.form, subForm, '$valid'),
        validator: subFormIsValid => subFormIsValid
      });

      this.validatorRegistry[page] = validators.map(v => new Validator(v, this, page, allowCompletion));

      return this;
    };

    class Validator {
      constructor(options, service, page, allowCompletion) {
        validateFunctionInput(options, requiredValidatorFields, 'Validator');
        let { watchString, validator } = options;

        service.scope.$watch(watchString, (value) => {
          this.state.valid = validator(value);

          if (this.state.valid) {
            this.emitValid();
          } else {
            this.emitInvalid()
          }
        });

        this.state = { valid : false };
        this.page = page;
        this.allowCompletion = allowCompletion;
        this.service = service;
      }

      emitValid() {
        if (this.allowCompletion) {
          let allAreValid = this.service.validatorRegistry[this.page]
            .reduce((acc, v) => {
              if (v.state.valid === false) {
                acc = false;
              }
              return acc;
            }, true);

          if (allAreValid) {
            v2modalWizardService.markComplete(this.page);
          }
        }
      }

      emitInvalid(){
        v2modalWizardService.markIncomplete(this.page);
      }
    }

    return this;
  });
