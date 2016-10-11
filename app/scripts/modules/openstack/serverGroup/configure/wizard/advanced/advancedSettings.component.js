'use strict';

import modalWizardServiceModule from 'core/modal/wizard/v2modalWizard.service';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.openstack.serverGroup.configure.wizard.advancedSettings.component', [
    modalWizardServiceModule,
  ])
  .component('openstackServerGroupAdvancedSettings', {
    bindings: {
      command: '=',
      application: '=',
    },
    templateUrl: require('./advancedSettings.component.html'),
    controller: function(v2modalWizardService) {
      this.fieldChanged = () => {
        if (this.command.userData) {
          v2modalWizardService.markComplete('advanced-settings');
        }
      };
    }
  });
