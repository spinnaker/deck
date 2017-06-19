import {APPLICATION_MODEL_BUILDER} from 'core/application/applicationModel.builder';

describe('Controller: deletePipelineModal', function() {
  const angular = require('angular');

  beforeEach(
    window.module(
      require('./delete.module.js'),
      APPLICATION_MODEL_BUILDER
    )
  );

  beforeEach(window.inject(function($controller, $rootScope, $log, $q, pipelineConfigService, $state, applicationModelBuilder) {
    this.$q = $q;
    this.application = applicationModelBuilder.createApplication('app', {
      key: 'pipelineConfigs',
      lazy: true,
      loader: () => this.$q.when(null),
      onLoad: () => this.$q.when(null),
    });
    this.initializeController = function(pipeline) {
      this.$state = $state;
      this.$scope = $rootScope.$new();
      this.pipelineConfigService = pipelineConfigService;
      this.$uibModalInstance = { close: angular.noop };
      this.controller = $controller('DeletePipelineModalCtrl', {
        $scope: this.$scope,
        application: this.application,
        pipeline: pipeline,
        pipelineConfigService: this.pipelineConfigService,
        $uibModalInstance: this.$uibModalInstance,
        $log: $log,
        $state: $state,
      });
      this.$scope.$digest();
    };
  }));

  describe('pipeline deletion', function() {

    beforeEach(function() {
      this.pipelines = [
        {name: 'a', index: 0},
        {name: 'b', index: 1},
        {name: 'c', index: 2}
      ];

      this.application.pipelineConfigs.activate();
      this.application.pipelineConfigs.data = [this.pipelines[0], this.pipelines[1], this.pipelines[2]];
      this.initializeController(this.pipelines[1]);

    });

    it('deletes pipeline, removes it from application, reindexes latter pipelines, and closes modal', function() {
      var $q = this.$q;
      var submittedPipeline = null,
          submittedApplication = null,
          newStateTarget = null,
          newStateOptions = null;

      spyOn(this.pipelineConfigService, 'deletePipeline').and.callFake(function (applicationName, {}, pipelineName) {
        submittedPipeline = pipelineName;
        submittedApplication = applicationName;
        return $q.when(null);
      });
      spyOn(this.pipelineConfigService, 'savePipeline');
      spyOn(this.$uibModalInstance, 'close');
      spyOn(this.$state, 'go').and.callFake(function (target, params, options) {
        newStateTarget = target;
        newStateOptions = options;
      });

      this.controller.deletePipeline();
      this.$scope.$digest();

      expect(submittedPipeline).toBe('b');
      expect(submittedApplication).toBe('app');
      expect(this.application.pipelineConfigs.data).toEqual([this.pipelines[0], this.pipelines[2]]);
      expect(this.pipelineConfigService.savePipeline).toHaveBeenCalledWith(this.pipelines[2]);
      expect(this.pipelineConfigService.savePipeline.calls.count()).toEqual(1);
      expect(this.pipelines[2].index).toBe(1);
      expect(newStateTarget).toBe('^.executions');
      expect(newStateOptions).toEqual({location: 'replace'});
    });

    it('sets error flag, message when save is rejected', function() {
      var $q = this.$q;
      spyOn(this.pipelineConfigService, 'deletePipeline').and.callFake(function () {
        return $q.reject({message: 'something went wrong'});
      });

      this.controller.deletePipeline();
      this.$scope.$digest();

      expect(this.$scope.viewState.saveError).toBe(true);
      expect(this.$scope.viewState.errorMessage).toBe('something went wrong');
    });

    it('provides default error message when none provided on failed save', function() {
      var $q = this.$q;
      spyOn(this.pipelineConfigService, 'deletePipeline').and.callFake(function () {
        return $q.reject({});
      });


      this.controller.deletePipeline();
      this.$scope.$digest();

      expect(this.$scope.viewState.saveError).toBe(true);
      expect(this.$scope.viewState.errorMessage).toBe('No message provided');
    });
  });

});
