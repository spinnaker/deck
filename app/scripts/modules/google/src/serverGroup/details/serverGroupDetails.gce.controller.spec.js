'use strict';

describe('Controller: gceServerGroupDetailsCtrl', function () {

  var controller;
  var scope;

  beforeEach(
    window.module(
      require('./serverGroupDetails.gce.controller')
    )
  );

  beforeEach(
    window.inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      controller = $controller('gceServerGroupDetailsCtrl', {
        $scope: scope,
        app: {
          serverGroups: { data: [] },
          loadBalancers: { data: [] },
        },
        serverGroup: {}
      });
    })
  );

  it('should instantiate the controller', function () {
    expect(controller).toBeDefined();
  });
});

