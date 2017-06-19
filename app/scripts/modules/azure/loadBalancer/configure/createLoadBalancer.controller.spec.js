'use strict';

import { API_SERVICE, APPLICATION_MODEL_BUILDER } from '@spinnaker/core';

describe('Controller: azureCreateLoadBalancerCtrl', function () {

  var $http;
  var API;

  // load the controller's module
  beforeEach(
    window.module(
      require('./createLoadBalancer.controller'),
      API_SERVICE,
      APPLICATION_MODEL_BUILDER
    )
  );

  // Initialize the controller and a mock scope
  beforeEach(window.inject(function ($controller, $rootScope, _API_, applicationModelBuilder) {
    API = _API_;
    const app = applicationModelBuilder.createApplication('app', {key: 'loadBalancers', lazy: true});
    this.$scope = $rootScope.$new();
    this.ctrl = $controller('azureCreateLoadBalancerCtrl', {
      $scope: this.$scope,
      $uibModalInstance: { dismiss: angular.noop, result: { then: angular.noop } },
      application: app,
      loadBalancer: null,
      isNew: true
    });
  }));

  beforeEach(window.inject(function($httpBackend) {
     // Set up the mock http service responses
     $http = $httpBackend;
   }));

  it('correctly creates a default loadbalancer', function() {
    var lb = this.$scope.loadBalancer;

    expect(lb.probes.length).toEqual(1);
    expect(lb.loadBalancingRules.length).toEqual(1);

    expect(lb.loadBalancingRules[0].protocol).toEqual('HTTP');

    expect(this.$scope.existingLoadBalancerNames).toEqual(undefined);
    expect(lb.providerType).toEqual(undefined);
  });

  it('makes the expected REST calls for data for a new loadbalancer', function() {
    $http.when('GET', API.baseUrl + '/networks').respond([]);
    $http.when('GET', API.baseUrl + '/securityGroups').respond({});
    $http.when('GET', API.baseUrl + '/credentials').respond([]);
    $http.when('GET', API.baseUrl + '/credentials/azure-test').respond([]);
    $http.when('GET', API.baseUrl + '/subnets').respond([]);

    $http.flush();
  });

});
