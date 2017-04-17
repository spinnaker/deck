'use strict';

let angular = require('angular');
import {INFRASTRUCTURE_CACHE_SERVICE} from 'core/cache/infrastructureCaches.service';

module.exports = angular
  .module('spinnaker.amazon.serverGroup.configure.wizard.securityGroups.selector.directive', [
    INFRASTRUCTURE_CACHE_SERVICE,
    require('../../serverGroupConfiguration.service.js'),
  ])
  .directive('serverGroupSecurityGroupSelector', function () {
    return {
      restrict: 'E',
      templateUrl: require('./securityGroupSelector.directive.html'),
      scope: {},
      bindToController: {
        command: '=',
        availableGroups: '<',
        hideLabel: '<',
        refresh: '&?',
        groupsToEdit: '=',
        helpKey: '@'
      },
      controllerAs: 'vm',
      controller: 'awsServerGroupSecurityGroupsSelectorCtrl',
    };
  }).controller('awsServerGroupSecurityGroupsSelectorCtrl', function (awsServerGroupConfigurationService, infrastructureCaches) {
    this.getSecurityGroupRefreshTime = () => {
      return infrastructureCaches.get('securityGroups').getStats().ageMax;
    };

    this.currentItems = 100;

    this.addItems = () => this.currentItems += 100;

    this.refreshSecurityGroups = () => {
      this.refreshing = true;
      if (this.refresh) {
        this.refresh().then(() => this.refreshing = false);
      } else {
        awsServerGroupConfigurationService.refreshSecurityGroups(this.command).then(() => {
          this.refreshing = false;
        });
      }
    };
  });
