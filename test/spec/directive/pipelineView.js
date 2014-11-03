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

describe('Directives: pipelines', function () {

  beforeEach(loadDeckWithoutCacheInitializer);

  beforeEach(inject(function ($rootScope, $compile, $) {
    this.scope = $rootScope.$new();
    this.compile = $compile;
    this.$ = $;
  }));

  beforeEach(function() {
    this.scope.$parent.lastVisibleExecutionIdx = 0;
  });

  function buildPipeline(executionCount, stageCount, status) {
    status = status || "completed";
    var executions = []
    for (var i=0;i<executionCount;i++) {
      var execution = {id:1,stages:[]};
      for (var j=0;j<stageCount;j++) {
        execution.stages.push({name:"init",status:status,steps:[]});
      }
      executions.push(execution);
    }
    return {  
      name:"release",
      executions: executions
    }
  } 

  function buildElem(compile, scope) {
    return compile(angular.element('<div><pipeline-view pipeline="pipeline"></pipeline-view></div>'))(scope);
  }

  it('builds the first four pipeline executions in the view', function() {
    var scope = this.scope,
        compile = this.compile;

    scope.pipeline = buildPipeline(5,1);
    scope.$digest();
    var pipeline = buildElem(compile,scope);
    scope.$digest();

    expect(pipeline.find('.pipeline').size()).toBe(4);
  });

  it("should load additional executions when requested", function() {
    var scope = this.scope,
        compile = this.compile;

    scope.pipeline = buildPipeline(5,1);
    scope.$digest();
    var pipeline = buildElem(compile,scope);
    scope.$digest();

    expect(pipeline.find('.pipeline').size()).toBe(4);
    scope.getMoreExecutions();
    scope.$digest();
    expect(pipeline.find('.pipeline').size()).toBe(5);
  });

  it("should return a style width commenserate to the proportion of stages", function() {
    var scope = this.scope,
        compile = this.compile;

    scope.pipeline = buildPipeline(1,3);
    scope.$digest();
    var el = buildElem(compile,scope);
    scope.$digest();
    expect(el.find('.segment').css('width')).toBe('33%');
  });

  it("should style the stages properly", function() {
    var scope = this.scope,
        compile = this.compile;

    scope.pipeline = buildPipeline(1,1,'COMPLETED');
    scope.$digest();
    var el = buildElem(compile,scope);
    scope.$digest();
    expect(el.find('.segment .bar').hasClass('completed')).toBe(true);

    scope.pipeline = buildPipeline(1,1,'EXECUTING');
    scope.$digest();
    el = buildElem(compile,scope);
    scope.$digest();
    expect(el.find('.segment .bar').hasClass('running')).toBe(true);
    expect(el.find('.segment .bar').hasClass('glow')).toBe(true);

  });

});
