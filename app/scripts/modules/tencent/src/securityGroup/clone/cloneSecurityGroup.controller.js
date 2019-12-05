'use strict';

const angular = require('angular');

import { AccountService, FirewallLabels } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.tencent.securityGroup.clone.controller', [
    require('../configure/configSecurityGroup.mixin.controller').name,
  ])
  .controller('tencentCloneSecurityGroupController', [
    '$scope',
    '$uibModalInstance',
    '$controller',
    'securityGroup',
    'application',
    function($scope, $uibModalInstance, $controller, securityGroup, application) {
      var vm = this;

      vm.firewallLabel = FirewallLabels.get('Firewall');

      $scope.pages = {
        location: require('../configure/createSecurityGroupProperties.html'),
        ingress: require('../configure/createSecurityGroupIngress.html'),
      };

      securityGroup.credentials = securityGroup.accountName;
      $scope.namePreview = securityGroup.name;

      angular.extend(
        this,
        $controller('tencentConfigSecurityGroupMixin', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          application: application,
          securityGroup: securityGroup,
        }),
      );

      AccountService.listAccounts('tencent').then(function(accounts) {
        $scope.accounts = accounts;
        vm.accountUpdated();
      });

      securityGroup.securityGroupIngress = securityGroup.inRules
        ? securityGroup.inRules.map(inRule => ({
            index: inRule.index,
            protocol: inRule.protocol,
            port: inRule.port,
            cidrBlock: inRule.cidrBlock,
            action: inRule.action,
            existing: true,
          }))
        : [];
      vm.upsert = function() {
        // <account-select-field> only updates securityGroup.credentials, but Orca looks at account* before looking at credentials
        // Updating the rest of the attributes to send the correct (expected) account for all attributes
        const { credentials } = $scope.securityGroup;
        Object.assign($scope.securityGroup, {
          account: credentials,
          accountName: credentials,
          accountId: credentials,
        });

        vm.mixinUpsert('Clone');
      };

      vm.initializeSecurityGroups();
    },
  ]);
