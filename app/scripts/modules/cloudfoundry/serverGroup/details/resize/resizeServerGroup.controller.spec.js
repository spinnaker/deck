'use strict';

describe('Controller: cfResizeServerGroupCtrl', function () {

  //NOTE: This is only testing the controllers dependencies. Please add more tests.

  var controller;
  var scope;

  beforeEach(
    window.module(
      require('./resizeServerGroup.controller').name
    )
  );

  beforeEach(
    window.inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      controller = $controller('cfResizeServerGroupCtrl', {
        $scope: scope,
        $uibModalInstance: { result: {then: angular.noop}},
        application: {},
        serverGroup: {
          asg:{
            minSize:1
          }
        }
      });
    })
  );

  it('should instantiate the controller', function () {
    expect(controller).toBeDefined();
  });
});


