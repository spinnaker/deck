'use strict';

const angular = require('angular');
import _ from 'lodash';
import { Subject } from 'rxjs';

import {
  AccountService,
  InfrastructureCaches,
  NameUtils,
  SECURITY_GROUP_READER,
  SecurityGroupWriter,
  FirewallLabels,
  TaskMonitor,
  ModalWizard,
} from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.tencent.securityGroup.baseConfig.controller', [
    require('@uirouter/angularjs').default,
    SECURITY_GROUP_READER,
  ])
  .controller('tencentConfigSecurityGroupMixin', [
    '$scope',
    '$state',
    '$uibModalInstance',
    'application',
    'securityGroup',
    'securityGroupReader',
    function($scope, $state, $uibModalInstance, application, securityGroup, securityGroupReader) {
      var ctrl = this;

      $scope.state = {
        submitting: false,
        refreshingSecurityGroups: false,
        removedRules: [],
        infiniteScroll: {
          numToAdd: 20,
          currentItems: 20,
        },
      };

      $scope.allVpcs = [];
      $scope.wizard = ModalWizard;
      $scope.hideClassic = false;
      $scope.regionFilters = [];
      ctrl.addMoreItems = function() {
        $scope.state.infiniteScroll.currentItems += $scope.state.infiniteScroll.numToAdd;
      };

      let getAccount = () => $scope.securityGroup.accountName || $scope.securityGroup.credentials;

      function onApplicationRefresh() {
        // If the user has already closed the modal, do not navigate to the new details view
        if ($scope.$$destroyed) {
          return;
        }
        $uibModalInstance.close();
        var newStateParams = {
          name: $scope.securityGroup.name,
          accountId: getAccount(),
          region: $scope.securityGroup.regions[0],
          vpcId: $scope.securityGroup.vpcId,
          provider: 'tencent',
        };
        if (!$state.includes('**.firewallDetails')) {
          $state.go('.firewallDetails', newStateParams);
        } else {
          $state.go('^.firewallDetails', newStateParams);
        }
      }

      function onTaskComplete() {
        application.securityGroups.refresh();
        application.securityGroups.onNextRefresh($scope, onApplicationRefresh);
      }

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: `Creating your ${FirewallLabels.get('firewall')}`,
        modalInstance: $uibModalInstance,
        onTaskComplete: onTaskComplete,
      });

      $scope.securityGroup = securityGroup;

      ctrl.initializeAccounts = () => {
        return AccountService.listAllAccounts('tencent').then(function(accounts) {
          $scope.accounts = accounts.filter(a => a.authorized !== false);
          $scope.allAccounts = accounts;
          ctrl.accountUpdated();
        });
      };

      ctrl.upsert = function() {
        $scope.taskMonitor.submit(function() {
          return SecurityGroupWriter.upsertSecurityGroup($scope.securityGroup, application, 'Create');
        });
      };

      function clearSecurityGroups() {
        $scope.availableSecurityGroups = [];
        $scope.existingSecurityGroupNames = [];
      }

      ctrl.accountUpdated = function() {
        const securityGroup = $scope.securityGroup;
        // sigh.
        securityGroup.account = securityGroup.accountId = securityGroup.accountName = securityGroup.credentials;
        AccountService.getRegionsForAccount(getAccount()).then(regions => {
          $scope.regionFilters = regions;
          $scope.regions = regions.map(region => region.name);
          clearSecurityGroups();
          ctrl.regionUpdated();
          if ($scope.state.isNew) {
            ctrl.updateName();
          }
        });
      };

      ctrl.regionUpdated = function() {
        configureFilteredSecurityGroups();
      };

      function configureFilteredSecurityGroups() {
        var account = getAccount();
        var region = $scope.securityGroup.region;
        var existingSecurityGroupNames = [];
        var availableSecurityGroups = [];

        var regionalGroupNames = _.get(allSecurityGroups, [account, 'tencent', region].join('.'), []).map(
          sg => sg.name,
        );

        existingSecurityGroupNames = _.uniq(existingSecurityGroupNames.concat(regionalGroupNames));

        if (!availableSecurityGroups.length) {
          availableSecurityGroups = existingSecurityGroupNames;
        } else {
          availableSecurityGroups = _.intersection(availableSecurityGroups, regionalGroupNames);
        }

        $scope.availableSecurityGroups = availableSecurityGroups;
        $scope.existingSecurityGroupNames = existingSecurityGroupNames;
        $scope.state.securityGroupsLoaded = true;
      }

      ctrl.mixinUpsert = function(descriptor) {
        const command = {
          cloudProvider: 'tencent',
          stack: $scope.securityGroup.stack,
          detail: $scope.securityGroup.detail,
          application: application.name,
          account: $scope.securityGroup.accountName,
          accountName: $scope.securityGroup.accountName,
          name: $scope.securityGroup.name,
          securityGroupDesc: $scope.securityGroup.description,
          region: $scope.securityGroup.region,
          inRules: $scope.securityGroup.securityGroupIngress.map(inRule => ({
            protocol: inRule.protocol,
            port: inRule.protocol == 'ICMP' ? undefined : inRule.port,
            cidrBlock: inRule.cidrBlock,
            action: inRule.action,
          })),
        };
        $scope.taskMonitor.submit(function() {
          return SecurityGroupWriter.upsertSecurityGroup(command, application, descriptor);
        });
      };

      function setSecurityGroupRefreshTime() {
        $scope.state.refreshTime = InfrastructureCaches.get('securityGroups').getStats().ageMax;
      }

      var allSecurityGroups = {};

      $scope.allSecurityGroupsUpdated = new Subject();
      $scope.coordinatesChanged = new Subject();

      ctrl.initializeSecurityGroups = function() {
        return securityGroupReader.getAllSecurityGroups().then(function(securityGroups) {
          setSecurityGroupRefreshTime();
          allSecurityGroups = securityGroups;
          var account = $scope.securityGroup.credentials || $scope.securityGroup.accountName;
          var region = $scope.securityGroup.regions[0];

          var availableGroups;
          if (account && region) {
            availableGroups = (securityGroups[account] && securityGroups[account].tencent[region]) || [];
          } else {
            availableGroups = securityGroups;
          }

          $scope.availableSecurityGroups = _.map(availableGroups, 'name');
          $scope.allSecurityGroups = securityGroups;
          $scope.allSecurityGroupsUpdated.next();
        });
      };

      ctrl.cancel = function() {
        $uibModalInstance.dismiss();
      };

      ctrl.updateName = function() {
        const { securityGroup } = $scope;
        const name = NameUtils.getClusterName(application.name, securityGroup.stack, securityGroup.detail);
        securityGroup.name = name;
        $scope.namePreview = name;
      };

      ctrl.namePattern = {
        test: function(name) {
          return classicPattern.test(name);
        },
      };

      ctrl.addRule = function(ruleset) {
        ruleset.push({
          action: 'ACCEPT',
          protocol: 'TCP',
          port: 7001,
        });
      };

      ctrl.removeRule = function(ruleset, index) {
        ruleset.splice(index, 1);
      };

      ctrl.dismissRemovedRules = function() {
        $scope.state.removedRules = [];
        ModalWizard.markClean('Ingress');
        ModalWizard.markComplete('Ingress');
      };

      var classicPattern = /^[\x20-\x7F]+$/;
    },
  ]);
