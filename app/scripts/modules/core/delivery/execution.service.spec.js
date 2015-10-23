'use strict';

describe('Service: executionService', function () {

  //NOTE: This is only testing the service dependencies. Please add more tests.

  var executionService;
  var $httpBackend;
  var apiHostProvider;

  beforeEach(
    window.module(
      require('./execution.service')
    )
  );

  beforeEach(
    window.inject(function (_executionService_, _$httpBackend_, _apiHostProvider_) {
      executionService = _executionService_;
      $httpBackend = _$httpBackend_;
      apiHostProvider = _apiHostProvider_;
    })
  );

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should instantiate the controller', function () {
    expect(executionService).toBeDefined();
  });

  describe('when fetching pipelines', function () {

    it('should resolve the promise if a 200 response is received with empty array', function(){
      let url = [
          apiHostProvider.baseUrl(),
          'applications',
          'deck',
          'pipelines',
        ].join('/');

      $httpBackend.expectGET(url).respond(200, []);

      let responsePromise = executionService.getAll({name:'deck'}, false);

      $httpBackend.flush();

      responsePromise
        .then((result) => {
          expect(result).toBeDefined();// only success should be called
          expect(result).toEqual([]);
        })
        .catch((reject) => {
          expect(reject).toBeUndefined();
        });
    });

    it('should reject the promise if a 429 response is received', function(){
      let url = [
        apiHostProvider.baseUrl(),
        'applications',
        'deck',
        'pipelines',
      ].join('/');

      $httpBackend.expectGET(url).respond(429, []);

      let responsePromise = executionService.getAll({name:'deck'}, false);

      $httpBackend.flush();

      responsePromise
        .then((result) => {
          expect(result).toBeUndefined();
        })
        .catch((result) => {
          expect(result).toBeDefined();// only reject should be called
        });
    });

  });
});

