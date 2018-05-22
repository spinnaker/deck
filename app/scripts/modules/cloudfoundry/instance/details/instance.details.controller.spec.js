'use strict';

describe('Controller: cfInstanceDetailsCtrl', function() {
  //NOTE: This is only testing the controllers dependencies. Please add more tests.
  var controller;
  var scope;

  beforeEach(window.module(require('./instance.details.controller.js').name));

  beforeEach(
    window.inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      controller = $controller('cfInstanceDetailsCtrl', {
        $scope: scope,
        instance: {},
        moniker: {},
        environment: 'test',
        app: { isStandalone: true },
      });
    }),
  );

  it('should instantiate the controller', function() {
    expect(controller).toBeDefined();
  });
});
