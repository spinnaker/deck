/*
 * Copyright 2014 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

describe('Filter: capitalizeFilter', function() {
  beforeEach(loadDeckWithoutCacheInitializer);

  beforeEach(inject(function ($rootScope, $compile, $) {
    this.scope = $rootScope.$new();
    this.compile = $compile;
    this.$ = $;
  }));

  function buildElem(compile, scope) {
    return compile(angular.element('<div>{{name | capitalize}}</div>'))(scope);
  }

  describe('the filter logic', function() {
    it('capitalizes the name', function() {
      var scope = this.scope,
          compile = this.compile;

      scope.name = 'foo';
      scope.$digest();
      var el = buildElem(compile,scope);
      scope.$digest();
      expect(el.html()).toBe('Foo');
    });
  });
});
