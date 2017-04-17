'use strict';

describe('Controller: awsResizeServerGroupCtrl', function () {

  //NOTE: This is only testing the controllers dependencies. Please add more tests.

  var controller;
  var scope;

  beforeEach(
    window.module(
      require('./resizeServerGroup.controller')
    )
  );

  beforeEach(
    window.inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      controller = $controller('awsResizeServerGroupCtrl', {
        $scope: scope,
        $uibModalInstance: { result: {then: angular.noop}},
        application: {},
        serverGroup: {
          asg:{
            minSize:0
          }
        }
      });
    })
  );

  it('should instantiate the controller', function () {
    expect(controller).toBeDefined();
  });
});


