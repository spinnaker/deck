import {mock} from 'angular';

import {
  EXAMPLE_APPLICATION_NAME_VALIDATOR, ExampleApplicationNameValidator,
  ExampleApplicationNameValidator2
} from './exampleApplicationName.validator';
import {VALIDATE_APPLICATION_NAME} from './validateApplicationName.directive';
import {AccountService} from 'core/account/account.service';

describe('Validator: validateApplicationName', function () {

  let validator1: ExampleApplicationNameValidator,
      validator2: ExampleApplicationNameValidator2,
      accountService: AccountService,
      $q: ng.IQService;

  beforeEach(
    mock.module(
      EXAMPLE_APPLICATION_NAME_VALIDATOR,
      VALIDATE_APPLICATION_NAME
    )
  );

  beforeEach(mock.inject(function ($rootScope: ng.IRootScopeService, $compile: ng.ICompileService,
                                   exampleApplicationNameValidator: ExampleApplicationNameValidator,
                                   exampleApplicationNameValidator2: ExampleApplicationNameValidator2,
                                   _accountService_: AccountService, _$q_: ng.IQService) {
    this.$rootScope = $rootScope;
    this.compile = $compile;
    validator1 = exampleApplicationNameValidator;
    validator2 = exampleApplicationNameValidator2;
    accountService = _accountService_;
    $q = _$q_;
  }));

  beforeEach(function() {
    this.initialize = function(val: string, cloudProviders: string[]) {
      this.scope = this.$rootScope.$new();
      this.scope.app = { name: val };
      this.scope.cp = cloudProviders;

      const input = '<input type="text" name="appName" ng-model="app.name" validate-application-name cloud-providers="cp"/>';

      const dom = '<form name="form">' + input + '</form>';

      this.compile(dom)(this.scope);
      this.scope.$digest();
    };

    this.isValid = function() {
      return this.scope.form.appName.$valid;
    };
  });

  describe('valid cases', function () {

    beforeEach(() => {
      spyOn(accountService, 'listProviders').and.returnValue($q.when([validator1.provider, validator2.provider]));
    });

    it('should be valid when no provider selected and name does not match warning or error condition', function () {
      this.initialize('zz' + validator1.WARNING_CONDITION, []);
      expect(this.isValid()).toBe(true);

      this.initialize('zz' + validator1.ERROR_CONDITION, []);
      expect(this.isValid()).toBe(true);

      this.initialize('zz' + validator2.WARNING_CONDITION, []);
      expect(this.isValid()).toBe(true);

      this.initialize('zz' + validator2.ERROR_CONDITION, []);
      expect(this.isValid()).toBe(true);
    });

    it('should be valid when a cloudProvider is selected and name does not match warning or error of other provider', function () {
      this.initialize(validator1.WARNING_CONDITION, [validator2.provider]);
      expect(this.isValid()).toBe(true);

      this.initialize(validator1.ERROR_CONDITION, [validator2.provider]);
      expect(this.isValid()).toBe(true);

      this.initialize(validator2.WARNING_CONDITION, [validator1.provider]);
      expect(this.isValid()).toBe(true);

      this.initialize(validator2.ERROR_CONDITION, [validator1.provider]);
      expect(this.isValid()).toBe(true);
    });

    it('should be valid when a name matches warnings', function () {
      this.initialize(validator1.WARNING_CONDITION, []);
      expect(this.isValid()).toBe(true);

      this.initialize(validator2.WARNING_CONDITION, []);
      expect(this.isValid()).toBe(true);

    });
  });

  describe('provider checks', function () {

    it('should not run validators on providers with no accounts configured', function () {
      spyOn(accountService, 'listProviders').and.returnValue($q.when([validator1.provider]));
      this.initialize(validator2.ERROR_CONDITION, []);
      expect(this.isValid()).toBe(true);
    });
  });

  describe ('invalid cases', function () {

    beforeEach(() => {
      spyOn(accountService, 'listProviders').and.returnValue($q.when([validator1.provider, validator2.provider]));
    });

    it('should be invalid if name is invalid for any provider and none specified', function () {
      this.initialize(validator1.ERROR_CONDITION, []);
      expect(this.isValid()).toBe(false);

      this.initialize(validator2.ERROR_CONDITION, []);
      expect(this.isValid()).toBe(false);
    });

    it('should be invalid if name is invalid for specified provider', function () {
      this.initialize(validator1.ERROR_CONDITION, [validator2.provider]);
      expect(this.isValid()).toBe(true);

      this.initialize(validator1.ERROR_CONDITION, [validator1.provider]);
      expect(this.isValid()).toBe(false);
    });

  });

  describe ('value/option changes', function () {

    beforeEach(() => {
      spyOn(accountService, 'listProviders').and.returnValue($q.when([validator1.provider, validator2.provider]));
    });

    it ('should flip when providers change', function () {
      this.initialize(validator2.ERROR_CONDITION, [validator1.provider]);
      expect(this.isValid()).toBe(true);

      this.scope.cp = [validator2.provider];
      this.scope.$digest();
      expect(this.isValid()).toBe(false);

      this.scope.cp = [validator1.provider];
      this.scope.$digest();
      expect(this.isValid()).toBe(true);
    });

    it ('should flip when name changes', function () {
      this.initialize(validator1.ERROR_CONDITION + 'zz', [validator1.provider]);
      expect(this.isValid()).toBe(true);

      this.scope.app.name = validator1.ERROR_CONDITION;
      this.scope.$digest();
      expect(this.isValid()).toBe(false);
    });

  });
});
