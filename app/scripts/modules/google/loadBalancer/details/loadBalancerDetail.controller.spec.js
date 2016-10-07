import modelBuilderModule from 'core/application/applicationModel.builder';

describe('Controller: LoadBalancerDetailsCtrl', function () {
  //NOTE: This is just a skeleton test to test DI.  Please add more tests.;

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
      modelBuilderModule
    )
  );

  beforeEach(
    window.inject(
      function($controller, $rootScope, _$state_, applicationModelBuilder) {
        $scope = $rootScope.$new();
        $state = _$state_;
        let app = applicationModelBuilder.createApplication({key: 'loadBalancers', lazy: true});
        app.loadBalancers.data.push(loadBalancer);
        controller = $controller('gceLoadBalancerDetailsCtrl', {
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
