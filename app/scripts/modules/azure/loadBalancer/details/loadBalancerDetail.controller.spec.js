'use strict';

describe('Controller: azureLoadBalancerDetailsCtrl', function () {
  var controller;
  var $scope;
  var $state;
  var loadBalancer = {
    name: 'foo',
    region: 'us-west-1',
    account: 'test',
    accountId: 'test',
    vpcId: '1'
  };


  beforeEach(
    window.module(
      require('./loadBalancerDetail.controller'),
      require('../../../core/application/service/applications.read.service')
    )
  );

  beforeEach(
    window.inject(
      function($controller, $rootScope, _$state_, applicationReader) {
        $scope = $rootScope.$new();
        $state = _$state_;
        let app = {};
        applicationReader.addSectionToApplication({key: 'loadBalancers', lazy: true}, app);
        app.loadBalancers.data.push(loadBalancer);
        controller = $controller('azureLoadBalancerDetailsCtrl', {
          $scope: $scope,
          loadBalancer: loadBalancer,
          app: app,
          $state: $state
        });
      }
    )
  );


  it('should have an instantiated controller', function () {
    expect(controller).toBeDefined();
  });

});
