'use strict';

describe('Directives: accountSelectField', function () {

  beforeEach(
    window.module(
      require('./accountSelectField.directive.js')
    )
  );

  var scope, accountService, accounts, ctrl, $q;

  beforeEach(window.inject(function ($rootScope, $controller, _accountService_, _$q_) {
    scope = $rootScope.$new();
    accountService = _accountService_;
    $q = _$q_;
    accounts = {
      aws: [
        {name: 'prod', type: 'aws', primaryAccount: true},
        {name: 'backup', type: 'aws', primaryAccount: false}
      ],
      titus: [
        {name: 'titusprod', type: 'titus', primaryAccount: true},
        {name: 'titusbackup', type: 'titus', primaryAccount: false}
      ]
    };
    ctrl = $controller('AccountSelectFieldCtrl', {
      $scope: scope,
      accountService: accountService
    });
    spyOn(accountService, 'getAllAccountDetailsForProvider').and.callFake((provider) => $q.when(accounts[provider]));

  }));

  it('groups accounts by primary field when provider not specified', function() {
    ctrl.accounts = accounts.aws.concat(accounts.titus);

    scope.$digest();

    expect(ctrl.primaryAccounts).toEqual(['prod', 'titusprod']);
    expect(ctrl.secondaryAccounts).toEqual(['backup', 'titusbackup']);
    expect(accountService.getAllAccountDetailsForProvider.calls.count()).toBe(2);
  });

  it('groups accounts by primary field when only one provider available', function() {
    ctrl.accounts = accounts.aws;

    scope.$digest();

    expect(ctrl.primaryAccounts).toEqual(['prod']);
    expect(ctrl.secondaryAccounts).toEqual(['backup']);
    expect(accountService.getAllAccountDetailsForProvider.calls.count()).toBe(1);
  });

  it('groups accounts by primary field when only names and provider supplied', function() {
    ctrl.accounts = accounts.aws.map((acct) => acct.name);
    ctrl.provider = 'aws';

    scope.$digest();

    expect(ctrl.primaryAccounts).toEqual(['prod']);
    expect(ctrl.secondaryAccounts).toEqual(['backup']);
    expect(accountService.getAllAccountDetailsForProvider.calls.count()).toBe(1);
  });

  it('sets mergedAccounts only if there are no accounts supplied', function () {
    ctrl.accounts = null;

    scope.$digest();

    expect(ctrl.mergedAccounts).toEqual([]);
    expect(ctrl.primaryAccounts).toBeUndefined();
    expect(ctrl.secondaryAccounts).toBeUndefined();
    expect(accountService.getAllAccountDetailsForProvider.calls.count()).toBe(0);
  });

  it('sets all accounts as primary when only names are supplied and provider is not set', function () {
    ctrl.accounts = ['prod', 'test'];

    scope.$digest();

    expect(ctrl.mergedAccounts).toEqual(['prod', 'test']);
    expect(ctrl.primaryAccounts).toEqual(['prod', 'test']);
    expect(ctrl.secondaryAccounts).toBeUndefined();
    expect(accountService.getAllAccountDetailsForProvider.calls.count()).toBe(0);
  });

  it('re-groups accounts when they change', function () {
    ctrl.accounts = ['prod', 'test'];

    scope.$digest();

    expect(ctrl.mergedAccounts).toEqual(['prod', 'test']);
    expect(ctrl.primaryAccounts).toEqual(['prod', 'test']);
    expect(ctrl.secondaryAccounts).toBeUndefined();
    expect(accountService.getAllAccountDetailsForProvider.calls.count()).toBe(0);

    ctrl.accounts.push('staging');
    scope.$digest();

    expect(ctrl.mergedAccounts).toEqual(['prod', 'test', 'staging']);
    expect(ctrl.primaryAccounts).toEqual(['prod', 'test', 'staging']);
    expect(ctrl.secondaryAccounts).toBeUndefined();
    expect(accountService.getAllAccountDetailsForProvider.calls.count()).toBe(0);
  });

  it('maintains selection of existing account', function () {
    ctrl.accounts = ['prod', 'test'];
    ctrl.component = [];
    ctrl.field = 'credentials';
    ctrl.component[ctrl.field] = 'prod';

    scope.$digest();

    expect(ctrl.component[ctrl.field]).toEqual('prod');
  });

  it('unselects nonexistent account', function () {
    ctrl.accounts = ['prod', 'test'];
    ctrl.component = [];
    ctrl.field = 'credentials';
    ctrl.component[ctrl.field] = 'nonexistent';

    scope.$digest();

    expect(ctrl.component[ctrl.field]).toBeNull();
  });

  it('maintains selection of existing account array', function () {
    ctrl.accounts = ['prod', 'test'];
    ctrl.component = [];
    ctrl.field = 'credentials';
    ctrl.component[ctrl.field] = ['test', 'prod'];

    scope.$digest();

    expect(ctrl.component[ctrl.field]).toEqual(['test', 'prod']);
  });

  it('unselects nonexistent account array', function () {
    ctrl.accounts = ['prod', 'test'];
    ctrl.component = [];
    ctrl.field = 'credentials';
    ctrl.component[ctrl.field] = ['nonexistent', 'prod'];

    scope.$digest();

    expect(ctrl.component[ctrl.field]).toBeNull();
  });
});
