'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.amazon.serverGroup.configure.wizard.advancedSettings.blockDevices.directive', [
  ])
  .directive('blockDevices', function () {
    return {
      restrict: 'E',
      templateUrl: require('./blockDevices.directive.html'),
      require: '^?form',
      scope: true,
      bindToController: {
        command: '=',
      },
      controllerAs: 'blockDevicesCtrl',
      controller: 'BlockDevicesCtrl',
      link: postLink
    };
  }).controller('BlockDevicesCtrl', function ($scope) {
    let self = this,
        currentBlocks = this.command.blockDevices && this.command.blockDevices.length;

    this.numberOfBlockDevices = currentBlocks ? currentBlocks : '';
    this.volumeType = currentBlocks ? this.command.blockDevices[0].volumeType : 'gp2';
    this.size = currentBlocks ? this.command.blockDevices[0].size : '';
    this.sizeRequired = !!currentBlocks;
    this.deleteOnTermination = currentBlocks ? this.command.blockDevices[0].deleteOnTermination : true;
    this.volumeSizeMin = 1;
    this.volumeSizeMax = 16384;
    this.volumeTypes = {
      'gp2': {
        min: 1,
        max: 16384
      },
      'st1': {
        min: 500,
        max: 16384
      },
      'sc1': {
        min: 500,
        max: 16384
      },
      'standard': {
        min: 1,
        max: 1024
      }
    };

    this.updateValue = updateValue;
    this.attachDevices = attachDevices;

    $scope.$watch('blockDevicesCtrl.numberOfBlockDevices', (newVal) => {
      if (typeof newVal !== 'undefined' && newVal !== '' && newVal > 0) {
        this.sizeRequired = true;
        this.command.blockDevices = [];
        this.attachDevices(newVal);
      } else {
        this.sizeRequired = false;
        delete this.command.blockDevices;
      }
    });
    $scope.$watch('blockDevicesCtrl.size', (newVal, oldVal) => {
      if (newVal !== oldVal) {
        this.updateValue('size', newVal);
      }
    });
    $scope.$watch('blockDevicesCtrl.volumeType', (newVal, oldVal) => {
      if (newVal !== oldVal) {
        this.volumeSizeMin = this.volumeTypes[newVal].min;
        this.volumeSizeMax = this.volumeTypes[newVal].max;
        this.updateValue('volumeType', newVal);
      }
    });
    $scope.$watch('blockDevicesCtrl.deleteOnTermination', (newVal, oldVal) => {
      if (newVal !== oldVal) {
        this.updateValue('deleteOnTermination', newVal);
      }
    });
    function updateValue(key, val) {
      if (!self.command.blockDevices) {
        return;
      }
      self.command.blockDevices.forEach((device) => {
        device[key] = val;
      });
    }
    function attachDevices(count) {
      while(count) {
        self.command.blockDevices.push({
          'deviceName': deviceNameFromInt(count),
          'size': self.size,
          'volumeType': self.volumeType,
          'deleteOnTermination': self.deleteOnTermination
        });
        count--;
      }
    }
    function deviceNameFromInt(int) {
      return '/dev/sd' + String.fromCharCode(97 + int);
    }
  });

function postLink($scope, element, attrs, form) {
  if (!form) {
    return;
  }
  $scope.$watch('blockDevicesCtrl.volumeType', (newVal, oldVal) => {
    if (newVal !== oldVal) {
      form.size.$setDirty();
    }
  });
  $scope.$watch('blockDevicesCtrl.numberOfBlockDevices', (newVal) => {
    if (typeof newVal !== 'undefined' && newVal !== '' && newVal > 0) {
      form.size.$setDirty();
    }
  });
}
