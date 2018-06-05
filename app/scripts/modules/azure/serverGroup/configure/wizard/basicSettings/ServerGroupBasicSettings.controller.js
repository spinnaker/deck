'use strict';

import { IMAGE_READER, ModalWizard } from '@spinnaker/core';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.azure.serverGroup.configure.basicSettings', [
    require('@uirouter/angularjs').default,
    require('angular-ui-bootstrap'),
    require('./image.regional.filter.js').name,
    IMAGE_READER,
  ])
  .controller('azureServerGroupBasicSettingsCtrl', function($scope, $controller, $uibModalStack, $state, imageReader) {
    $scope.$watch('form.$valid', function(newVal) {
      if (newVal) {
        ModalWizard.markClean('basic-settings');
        ModalWizard.markComplete('basic-settings');
      } else {
        ModalWizard.markIncomplete('basic-settings');
      }
    });

    this.imageChanged = image => {
      $scope.command.imageName = image.imageName;
      $scope.command.selectedImage = image;
      ModalWizard.markClean('basic-settings');
    };

    angular.extend(
      this,
      $controller('BasicSettingsMixin', {
        $scope: $scope,
        imageReader: imageReader,
        $uibModalStack: $uibModalStack,
        $state: $state,
      }),
    );
  });
