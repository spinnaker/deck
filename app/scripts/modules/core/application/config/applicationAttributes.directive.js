'use strict';

import {get} from 'lodash';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.application.config.attributes.directive', [
    require('../modal/editApplication.controller.modal.js'),
    require('../../overrideRegistry/override.registry.js'),
  ])
  .directive('applicationAttributes', function (overrideRegistry) {
    return {
      restrict: 'E',
      templateUrl: overrideRegistry.getTemplate('applicationAttributesDirective', require('./applicationAttributes.directive.html')),
      scope: {},
      bindToController: {
        application: '=',
      },
      controller: 'ApplicationAttributesCtrl',
      controllerAs: 'vm',
    };
  })
  .controller('ApplicationAttributesCtrl', function ($uibModal, overrideRegistry) {

    const cpHealthMsg = 'considers only cloud provider health when executing tasks';
    const healthOverrideMsg = 'shows a health override option for each operation';
    const setHealthMessage = () => {
      const hasHealth = get(this.application, 'attributes.platformHealthOnly', false);
      const hasOverride = get(this.application, 'attributes.platformHealthOnlyShowOverride', false);
      this.healthMessage = 'This application ';
      if (hasHealth) {
        this.healthMessage += cpHealthMsg;
        if (hasOverride) {
          this.healthMessage += `. and ${healthOverrideMsg}.`;
        } else {
          this.healthMessage += '.';
        }
      } else if (hasOverride) {
        this.healthMessage += `${healthOverrideMsg}.`;
      }
    };
    setHealthMessage();

    this.editApplication = () => {
      $uibModal.open({
        templateUrl: overrideRegistry.getTemplate('editApplicationModal', require('../modal/editApplication.html')),
        controller: overrideRegistry.getController('EditApplicationController'),
        controllerAs: 'editApp',
        resolve: {
          application: () => {
            return this.application;
          }
        }
      }).result.then((newAttributes) => {
          this.application.attributes = newAttributes;
          setHealthMessage();
        });
    };
  });
