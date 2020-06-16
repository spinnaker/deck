import { mock } from 'angular';

import { SETTINGS } from 'core/config/settings';
import { ExecutionInformationService } from './executionInformation.service';

describe('Service: executionInformation', () => {
  let $httpBackend: ng.IHttpBackendService;
  const informationService = new ExecutionInformationService();
  const pipelines = [{}];
  const pipelineConfigs = [{}];

  beforeEach(
    mock.inject(function(_$httpBackend_: ng.IHttpBackendService) {
      $httpBackend = _$httpBackend_;
    }),
  );

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('function getExecution', () => {
    xit('should return the execution by id', () => {
      const executionId = '01D0Q77DZYFYY30D4YJ3BX3YAV';
      const url = [SETTINGS.gateUrl, 'pipelines', executionId].join('/');
      const execution = {};
      let actual;
      let suceeded = false;

      $httpBackend.expectGET(url).respond(200, pipelines);
      informationService.getExecution(executionId).then(result => {
        actual = result;
        suceeded = true;
      });
      expect(suceeded).toBe(true);
      $httpBackend.flush();

      expect(actual).toEqual(execution);
    });
  });

  describe('function getPipelineConfig', () => {
    xit('should return the pipeline config by application and pipeline id', () => {
      const application = 'gae';
      const pipelineConfigId = '5a452958-7e81-48ba-9a4f-3433024562c4';
      const url = [SETTINGS.gateUrl, 'applications', application, 'pipelineConfigs'].join('/');
      let actual;
      let suceeded = false;

      $httpBackend.expectGET(url).respond(200, pipelineConfigs);
      informationService.getPipelineConfig(application, pipelineConfigId).then(result => {
        actual = result;
        suceeded = true;
      });
      expect(suceeded).toBe(true);
      $httpBackend.flush();

      expect(actual).toEqual(actual);
    });
  });
});
