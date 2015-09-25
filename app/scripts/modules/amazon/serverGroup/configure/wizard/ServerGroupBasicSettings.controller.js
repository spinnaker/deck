'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.aws.basicSettings', [
  require('../../../../modal/wizard/modalWizard.service.js'),
  require('../../../../image/image.reader.js'),
  require('../../../../naming/naming.service.js'),
  require('../../../../utils/rx.js'),
  require('../../../../serverGroups/configure/common/basicSettingsMixin.controller.js'),
])
  .controller('awsServerGroupBasicSettingsCtrl', function($scope, $controller, modalWizardService, RxService,
                                                          imageReader, namingService, $modalStack, $state) {

    angular.extend(this, $controller('BasicSettingsMixin', {
      $scope: $scope,
      RxService: RxService,
      imageReader: imageReader,
      namingService: namingService,
      $modalStack: $modalStack,
      $state: $state,
    }));

    $scope.$watch('form.$valid', function(newVal) {
      if (newVal) {
        modalWizardService.getWizard().markClean('location');
      } else {
        modalWizardService.getWizard().markDirty('location');
      }
    });

  }).name;
