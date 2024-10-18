'use strict';

describe('Component: mapObjectEditor', function () {
  var scope;

  beforeEach(window.module(require('./mapObjectEditor.component').name));

  beforeEach(
    window.inject(function ($rootScope, $compile) {
      scope = $rootScope.$new();
      this.compile = $compile;
    }),
  );

  it('initializes with provided values', function () {
    scope.model = { foo: { bar: 'baz' }, bah: 11 };
    let dom = this.compile('<map-object-editor model="model"></map-object-editor>')(scope);
    scope.$digest();

    expect(dom.find('input').length).toBe(2);
    expect(dom.find('textarea').length).toBe(2);

    expect(dom.find('input').get(0).value).toBe('foo');
    expect(dom.find('textarea').get(0).value).toBe(JSON.stringify({ bar: 'baz' }));
    expect(dom.find('input').get(1).value).toBe('bah');
    expect(dom.find('textarea').get(1).value).toBe('11');
  });

  describe('empty value handling', function () {
    it('ignores empty values when synchronizing to the model', function () {
      scope.model = { foo: { bar: 'baz' }, bah: 11 };
      let dom = this.compile('<map-object-editor model="model"></map-object-editor>')(scope);
      scope.$digest();

      $(dom.find('textarea')[1]).val('').change();
      scope.$digest();

      expect(scope.model.foo).toEqual({ bar: 'baz' });
      expect(scope.model.bah).toBeUndefined();
    });

    it('writes empty values when allowEmpty flag is set', function () {
      scope.model = { foo: { bar: 'baz' }, bah: 11 };
      let dom = this.compile('<map-object-editor model="model" allow-empty="true"></map-object-editor>')(scope);
      scope.$digest();

      $(dom.find('textarea')[1]).val('').change();
      scope.$digest();

      expect(scope.model.foo).toEqual({ bar: 'baz' });
      expect(scope.model.bah).toBe('');
    });
  });

  describe('adding new entries', function () {
    it('creates a new row in the table, but does not synchronize to model', function () {
      scope.model = {};
      let dom = this.compile('<map-object-editor model="model"></map-object-editor>')(scope);
      scope.$digest();
      dom.find('button').click();
      expect(dom.find('tbody tr').length).toBe(1);
      expect(dom.find('input').length).toBe(1);
      expect(dom.find('textarea').length).toBe(1);
    });

    it('does not flag multiple new rows without keys as having duplicate keys', function () {
      scope.model = {};
      let dom = this.compile('<map-object-editor model="model"></map-object-editor>')(scope);
      scope.$digest();
      dom.find('button').click();
      dom.find('button').click();

      expect(dom.find('tbody tr').length).toBe(2);
      expect(dom.find('input').length).toBe(2);
      expect(dom.find('textarea').length).toBe(2);

      expect(dom.find('.error-message').length).toBe(0);
    });
  });

  describe('removing entries', function () {
    it('removes the entry when the trash can is clicked', function () {
      scope.model = { foo: { bar: 'baz' } };
      let dom = this.compile('<map-object-editor model="model"></map-object-editor>')(scope);
      scope.$digest();

      expect(dom.find('input').length).toBe(1);
      expect(dom.find('textarea').length).toBe(1);

      dom.find('a').click();

      expect(dom.find('tbody tr').length).toBe(0);
      expect(dom.find('input').length).toBe(0);
      expect(dom.find('textarea').length).toBe(0);
      expect(scope.model.foo).toBeUndefined();
    });
  });

  describe('duplicate key handling', function () {
    it('provides a warning when a duplicate key is entered', function () {
      scope.model = { a: { bar: 'baz' }, b: '2' };
      let dom = this.compile('<map-object-editor model="model"></map-object-editor>')(scope);
      scope.$digest();

      $(dom.find('input')[1]).val('a').trigger('input');
      scope.$digest();

      expect(dom.find('.error-message').length).toBe(1);
    });
  });

  describe('hidden keys', function () {
    it('does not render key if included in `hiddenKeys`', function () {
      scope.model = { a: '1', b: { foo: 'bar' } };
      scope.hiddenKeys = ['a'];
      const dom = this.compile('<map-object-editor model="model" hidden-keys="hiddenKeys"></map-object-editor>')(scope);
      scope.$digest();

      expect($(dom.find('tbody tr')).length).toBe(1);
      expect(dom.find('input').get(0).value).toBe('b');
      expect(dom.find('textarea').get(0).value).toBe(JSON.stringify({ foo: 'bar' }));
    });
  });
});
