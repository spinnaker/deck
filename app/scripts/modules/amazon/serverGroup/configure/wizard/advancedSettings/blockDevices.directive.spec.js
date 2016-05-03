'use strict';

describe('Controller: BlockDevicesCtrl', function () {

  var scope,
      blockDevicesCtrl;

  beforeEach(window.module(require('./blockDevices.directive.js')));

  beforeEach(window.inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    blockDevicesCtrl = $controller('BlockDevicesCtrl',{
      $scope: scope
    },{
      command: {
      }
    });
    scope.blockDevicesCtrl = blockDevicesCtrl;
  }));

  it('should toggle sizeRequired based on numberOfBlockDevices', function() {
    expect(blockDevicesCtrl.sizeRequired).toBe(false);
    scope.blockDevicesCtrl.numberOfBlockDevices = 2;
    scope.$digest();
    expect(blockDevicesCtrl.sizeRequired).toBe(true);
    scope.blockDevicesCtrl.numberOfBlockDevices = 0;
    scope.$digest();
    expect(blockDevicesCtrl.sizeRequired).toBe(false);
  });

  it('should add and remove block devices based on number', function(){
    expect(blockDevicesCtrl.command.blockDevices).toBe(undefined);
    scope.blockDevicesCtrl.numberOfBlockDevices = 2;
    scope.$digest();
    expect(blockDevicesCtrl.command.blockDevices.length).toBe(2);
    scope.blockDevicesCtrl.numberOfBlockDevices = 0;
    scope.$digest();
    expect(blockDevicesCtrl.command.blockDevices).toBe(undefined);
  });

  it('should set the correct min and max volume size based on volumeType', function(){
    scope.blockDevicesCtrl.volumeType = 'sc1';
    scope.$digest();
    expect(scope.blockDevicesCtrl.volumeSizeMax).toBe(16384);
  });

  it('should update the size value on every block device', function() {
    var newValue = 2;
    scope.blockDevicesCtrl.numberOfBlockDevices = 2;
    scope.$digest();
    blockDevicesCtrl.command.blockDevices.forEach(function(device){
      expect(device.size).toBe('');
    });
    scope.blockDevicesCtrl.size = newValue;
    scope.$digest();
    blockDevicesCtrl.command.blockDevices.forEach(function(device){
      expect(device.size).toBe(newValue);
    });
  });
});
