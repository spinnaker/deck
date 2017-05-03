import {IDeferred, IHttpBackendService, IQService, IRootScopeService, IScope, mock} from 'angular';

import {SETTINGS} from 'core/config/settings';
import {MANUAL_JUDGMENT_SERVICE, ManualJudgmentService} from './manualJudgment.service';
import {ExecutionService} from 'core/delivery/service/execution.service';

describe('Service: manualJudgment', () => {

  let $scope: IScope,
      service: ManualJudgmentService,
      $http: IHttpBackendService,
      $q: IQService,
      executionService: ExecutionService;

  beforeEach(mock.module(MANUAL_JUDGMENT_SERVICE));

  beforeEach(mock.inject(($rootScope: IRootScopeService,
                          manualJudgmentService: ManualJudgmentService,
                          $httpBackend: IHttpBackendService,
                          _$q_: IQService,
                          _executionService_: ExecutionService) => {
    $scope = $rootScope.$new();
    service = manualJudgmentService;
    $http = $httpBackend;
    $q = _$q_;
    executionService = _executionService_;
  }));

  describe('provideJudgment', () => {
    let execution: any,
        stage: any,
        requestUrl: string;
    beforeEach(() => {
      execution = { id: 'ex-id' };
      stage = { id: 'stage-id' };
      requestUrl = [SETTINGS.gateUrl, 'pipelines', execution.id, 'stages', stage.id].join('/');
    });

    it('should resolve when execution status matches request', () => {
      const deferred: IDeferred<boolean> = $q.defer();
      let succeeded = false;

      $http.expectPATCH(requestUrl).respond(200, '');
      spyOn(executionService, 'waitUntilExecutionMatches').and.returnValue(deferred.promise);

      service.provideJudgment(execution, stage, 'continue').then(() => succeeded = true);

      $http.flush();
      expect(succeeded).toBe(false);

      // waitForExecutionMatches...
      deferred.resolve();
      $scope.$digest();

      expect(succeeded).toBe(true);
    });

    it('should fail when waitUntilExecutionMatches fails', () => {
      const deferred: IDeferred<boolean> = $q.defer();
      let succeeded = false,
          failed = false;

      $http.expectPATCH(requestUrl).respond(200, '');
      spyOn(executionService, 'waitUntilExecutionMatches').and.returnValue(deferred.promise);

      service.provideJudgment(execution, stage, 'continue').then(() => succeeded = true, () => failed = true);

      $http.flush();
      expect(succeeded).toBe(false);
      expect(failed).toBe(false);

      // waitForExecutionMatches...
      deferred.reject();
      $scope.$digest();

      expect(succeeded).toBe(false);
      expect(failed).toBe(true);
    });

    it('should fail when patch call fails', () => {
      let succeeded = false,
          failed = false;

      $http.expectPATCH(requestUrl).respond(503, '');

      service.provideJudgment(execution, stage, 'continue').then(() => succeeded = true, () => failed = true);

      $http.flush();
      expect(succeeded).toBe(false);
      expect(failed).toBe(true);
    });

  });
});
