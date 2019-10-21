'use strict';

import { get } from 'lodash';

const angular = require('angular');

import { OVERRIDE_REGISTRY } from 'core/overrideRegistry/override.registry';
import { ReactModal } from 'core/presentation';
import { EditApplicationModal } from '../modal/EditApplicationModal';

module.exports = angular
  .module('spinnaker.core.application.config.attributes.directive', [OVERRIDE_REGISTRY])
  .directive('applicationAttributes', [
    'overrideRegistry',
    function(overrideRegistry) {
      return {
        restrict: 'E',
        templateUrl: overrideRegistry.getTemplate(
          'applicationAttributesDirective',
          require('./applicationAttributes.directive.html'),
        ),
        scope: {},
        bindToController: {
          application: '=',
        },
        controller: 'ApplicationAttributesCtrl',
        controllerAs: 'vm',
      };
    },
  ])
  .controller('ApplicationAttributesCtrl', [
    '$scope',
    '$uibModal',
    'overrideRegistry',
    function($scope) {
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

      const setPermissions = () => {
        const permissions = get(this.application, 'attributes.permissions');
        if (permissions) {
          const permissionsMap = new Map();
          (permissions.READ || []).forEach(role => {
            permissionsMap.set(role, 'read');
          });
          (permissions.EXECUTE || []).forEach(role => {
            if (permissionsMap.has(role)) {
              permissionsMap.set(role, permissionsMap.get(role) + ', execute');
            } else {
              permissionsMap.set(role, 'execute');
            }
          });
          (permissions.WRITE || []).forEach(role => {
            if (permissionsMap.has(role)) {
              permissionsMap.set(role, permissionsMap.get(role) + ', write');
            } else {
              permissionsMap.set(role, 'write');
            }
          });

          if (permissionsMap.size) {
            this.permissions = Array.from(permissionsMap)
              .map(([role, accessTypes]) => `${role} (${accessTypes})`)
              .join(', ');
          } else {
            this.permissions = null;
          }
        } else {
          this.permissions = null;
        }
      };
      setPermissions();

      this.editApplication = () => {
        ReactModal.show(EditApplicationModal, { application: this.application })
          .then(newAttributes => {
            $scope.$applyAsync(() => {
              this.application.attributes = newAttributes;
              setHealthMessage();
              setPermissions();
            });
          })
          .catch(() => {});
      };
    },
  ]);
