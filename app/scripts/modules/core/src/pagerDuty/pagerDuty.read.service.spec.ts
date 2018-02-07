import { IHttpBackendService, mock } from 'angular';

import { Api, API_SERVICE } from 'core/api/api.service';

import { IPagerDutyService, PagerDutyReader } from './pagerDuty.read.service';

describe('PagerDutyReader', () => {

  let $http: IHttpBackendService;
  let API: Api;
  let pagerDutyReader: PagerDutyReader;

  beforeEach(mock.module(API_SERVICE));
  beforeEach(mock.inject((_$httpBackend_: IHttpBackendService,
                          _API_: Api) => {
    $http = _$httpBackend_;
    API = _API_;
    pagerDutyReader = new PagerDutyReader(API);
  }));

  afterEach(function () {
    $http.verifyNoOutstandingExpectation();
    $http.verifyNoOutstandingRequest();
  });

  it('should return an empty array when configured to do so and invoked', () => {

    const services: IPagerDutyService[] = [];
    $http.whenGET(`${API.baseUrl}/pagerDuty/services`).respond(200, services);

    let executed = false;
    pagerDutyReader.listServices().subscribe((pagerDutyServices: IPagerDutyService[]) => {
      expect(pagerDutyServices).toBeDefined();
      expect(pagerDutyServices.length).toBe(0);
      executed = true; // can't use done() function b/c $digest is already in progress
    });

    $http.flush();
    expect(executed).toBeTruthy();
  });

  it('should return a non-empty array when configured to do so and invoked', () => {

    const services: IPagerDutyService[] = [
      { name: 'one', integration_key: 'one_key', id: '1', policy: 'ABCDEF', lastIncidentTimestamp: '1970' },
      { name: '2', integration_key: 'two_key', id: '2', policy: 'ABCDEG', lastIncidentTimestamp: '1970' }
    ];
    $http.whenGET(`${API.baseUrl}/pagerDuty/services`).respond(200, services);

    let executed = false;
    pagerDutyReader.listServices().subscribe((pagerDutyServices: IPagerDutyService[]) => {
      expect(pagerDutyServices).toBeDefined();
      expect(pagerDutyServices.length).toBe(2);
      executed = true; // can't use done() function b/c $digest is already in progress
    });

    $http.flush();
    expect(executed).toBeTruthy();
  });
});
