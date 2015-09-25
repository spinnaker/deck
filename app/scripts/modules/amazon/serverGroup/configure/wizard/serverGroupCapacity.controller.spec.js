'use strict';

describe('Controller: ServerGroupCapacitySelector', function () {

  beforeEach(
    window.module(
      require('./ServerGroupCapacity.controller.js')
    )
  );

  beforeEach(window.inject(function ($controller, $rootScope, modalWizardService) {
    this.scope = $rootScope.$new();

    this.scope.command = {
      capacity: {
        min: 0,
        max: 0,
        desired: 0
      },
      viewState: {
        useSimpleCapacity: false
      }
    };

    spyOn(modalWizardService, 'getWizard').and.returnValue( { markComplete: angular.noop, markClean: angular.noop });

    this.ctrl = $controller('awsServerGroupCapacityCtrl', {
      $scope: this.scope,
    });

  }));


  it('synchronizes capacity only when in simple capacity mode', function() {
    var scope = this.scope,
        command = scope.command;

    command.viewState.useSimpleCapacity = true;
    command.capacity.desired = 2;
    scope.setMinMax(command.capacity.desired);

    expect(command.capacity.min).toBe(2);
    expect(command.capacity.max).toBe(2);

    command.viewState.useSimpleCapacity = false;
    command.capacity.desired = 1;
    scope.setMinMax(command.capacity.desired);

    expect(command.capacity.min).toBe(2);
    expect(command.capacity.max).toBe(2);

  });


});
