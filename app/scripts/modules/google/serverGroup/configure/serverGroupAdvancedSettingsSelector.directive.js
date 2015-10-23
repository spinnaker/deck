'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.gce.advancedSettingSelector', [])
  .directive('gceServerGroupAdvancedSettingsSelector', function() {
    return {
      restrict: 'E',
      scope: {
        command: '=',
      },
      templateUrl: require('./serverGroupAdvancedSettingsDirective.html'),
      controller: 'gceServerGroupAdvancedSettingsSelectorCtrl as advancedSettingsCtrl',
    };
  })
  .controller('gceServerGroupAdvancedSettingsSelectorCtrl', function($scope) {
    this.addInstanceMetadata = function() {
      $scope.command.instanceMetadata.push({});
    };

    this.removeInstanceMetadata = function(index) {
      $scope.command.instanceMetadata.splice(index, 1);
    };

    this.addTag = function() {
      $scope.command.tags.push({});
    };

    this.removeTag = function(index) {
      $scope.command.tags.splice(index, 1);
    };

  });
