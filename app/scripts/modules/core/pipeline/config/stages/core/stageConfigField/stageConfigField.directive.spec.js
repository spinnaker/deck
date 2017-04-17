'use strict';

describe('Directives: stageConfigField', function () {

  var scope, compile, helpContents;

  require('./stageConfigField.directive.html');

  beforeEach(
    window.module(
      require('./stageConfigField.directive.js')
    )
  );

  // https://docs.angularjs.org/guide/migration#migrate1.5to1.6-ng-services-$compile
  beforeEach(
    window.module(($compileProvider) => {
    $compileProvider.preAssignBindingsEnabled(true);
  }));

  beforeEach(window.inject(function ($rootScope, $compile, _helpContents_) {
    scope = $rootScope.$new();
    compile = $compile;
    helpContents = _helpContents_;
  }));

  it('initializes label', function () {
    var field = compile('<stage-config-field label="The Label"></stage-config-field>')(scope);

    scope.$digest();

    expect(field.find('.label-text').html()).toEqual('The Label');

  });

  it('updates label', function () {
    scope.foo = true;

    var field = compile('<stage-config-field label="{{foo ? \'foo\' : \'bar\'}}"></stage-config-field>')(scope);

    scope.$digest();
    expect(field.find('.label-text').html()).toEqual('foo');

    scope.foo = false;
    scope.$digest();
    expect(field.find('.label-text').html()).toEqual('bar');
  });

  it('includes help text if provided', function () {
    helpContents['foo.bar'] = 'Some help';

    var field = compile('<stage-config-field label="Label" help-key="foo.bar"></stage-config-field>')(scope);
    scope.$digest();
    expect(field.find('a.help-field').size()).toBe(1);

    field = compile('<stage-config-field label="Label" help-key="foo.bar.baz"></stage-config-field>')(scope);
    scope.$digest();
    expect(field.find('a.help-field').size()).toBe(0);
  });

  it('transcludes content, defaulting to 8-columns', function () {
    var field = compile('<stage-config-field label="Label"><h3>The content</h3></stage-config-field>')(scope);
    scope.$digest();
    expect(field.find('.col-md-8 h3').html()).toBe('The content');
  });

  it('allows columns to be overridden for field', function () {
    var field = compile('<stage-config-field label="Label" field-columns="3"><h3>The content</h3></stage-config-field>')(scope);
    scope.$digest();
    expect(field.find('.col-md-3 h3').html()).toBe('The content');
  });
});
