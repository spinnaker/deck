'use strict';

const angular = require('angular');
import _ from 'lodash';

import {
  ACCOUNT_SERVICE,
  NETWORK_READ_SERVICE,
  SECURITY_GROUP_READER,
  SECURITY_GROUP_WRITER,
  TASK_MONITOR_BUILDER,
  V2_MODAL_WIZARD_SERVICE
} from '@spinnaker/core';

import { GCE_SECURITY_GROUP_HELP_TEXT_SERVICE } from '../securityGroupHelpText.service';

import './securityGroup.configure.less';

module.exports = angular
  .module('spinnaker.google.securityGroup.baseConfig.controller', [
    require('@uirouter/angularjs').default,
    TASK_MONITOR_BUILDER,
    ACCOUNT_SERVICE,
    NETWORK_READ_SERVICE,
    V2_MODAL_WIZARD_SERVICE,
    SECURITY_GROUP_READER,
    SECURITY_GROUP_WRITER,
    GCE_SECURITY_GROUP_HELP_TEXT_SERVICE,
  ])
  .controller('gceConfigSecurityGroupMixin', function ($scope,
                                                       $state,
                                                       $uibModalInstance,
                                                       taskMonitorBuilder,
                                                       application,
                                                       securityGroup,
                                                       securityGroupReader,
                                                       securityGroupWriter,
                                                       accountService,
                                                       v2modalWizardService,
                                                       cacheInitializer,
                                                       networkReader,
                                                       gceSecurityGroupHelpTextService,
                                                       mode) {



    var ctrl = this;

    $scope.isNew = true;

    $scope.state = {
      submitting: false,
      refreshingSecurityGroups: false,
      removedRules: [],
      infiniteScroll: {
        numToAdd: 20,
        currentItems: 20,
      },
      mode: mode,
      target: null,
      targetOptions: null,
    };

    $scope.wizard = v2modalWizardService;


    ctrl.getTagHelpText = function(tag, tagType) {
      return gceSecurityGroupHelpTextService.getHelpTextForTag(tag, tagType);
    };

    ctrl.addMoreItems = function() {
      $scope.state.infiniteScroll.currentItems += $scope.state.infiniteScroll.numToAdd;
    };

    ctrl.registerHelpTextService = function() {
      gceSecurityGroupHelpTextService.register(application, $scope.securityGroup.credentials || $scope.securityGroup.accountName, securityGroup.network);
    };

    ctrl.initializeTargetOptions = function() {
      let options = ['allowAllTraffic', 'specifyTags'];
      if ($scope.state.mode === 'edit') {
        $scope.state.targetOptions = options;
      } else {
        $scope.state.targetOptions = ['autoGenerate'].concat(options);
      }
    };

    ctrl.initializeTarget = function() {
      if ($scope.state.mode === 'create') {
        $scope.state.target = 'autoGenerate';
      } else {
        if ($scope.securityGroup.targetTags && $scope.securityGroup.targetTags.length > 0) {
          $scope.state.target = 'specifyTags';
        } else {
          $scope.state.target = 'allowAllTraffic';
        }
      }
    };

    ctrl.getTargetLabel = function(target) {
      switch (target) {
        case 'autoGenerate':
          return 'Auto-generate target tag';
        case 'allowAllTraffic':
          return 'Allow traffic to all server groups';
        case 'specifyTags':
          return 'Specify target tags';
        default:
          return null;
      }
    };

    ctrl.onTargetChange = function() {
      switch ($scope.state.target) {
        case 'autoGenerate':
          $scope.securityGroup.targetTags = null;
          break;
        case 'allowAllTraffic':
          $scope.securityGroup.targetTags = [];
          break;
        case 'specifyTags':
          $scope.securityGroup.targetTags = $scope.securityGroup.targetTags || [];
          break;
        default:
          break;
      }
    };

    function onApplicationRefresh() {
      // If the user has already closed the modal, do not navigate to the new details view
      if ($scope.$$destroyed) {
        return;
      }
      $uibModalInstance.close();
      var newStateParams = {
        name: $scope.securityGroup.name,
        accountId: $scope.securityGroup.credentials || $scope.securityGroup.accountName,
        region: 'global',
        vpcId: $scope.securityGroup.vpcId,
        provider: 'gce',
      };
      if (!$state.includes('**.securityGroupDetails')) {
        $state.go('.securityGroupDetails', newStateParams);
      } else {
        $state.go('^.securityGroupDetails', newStateParams);
      }
    }

    function onTaskComplete() {
      application.securityGroups.refresh();
      application.securityGroups.onNextRefresh($scope, onApplicationRefresh);
    }

    $scope.taskMonitor = taskMonitorBuilder.buildTaskMonitor({
      application: application,
      title: 'Creating your security group',
      modalInstance: $uibModalInstance,
      onTaskComplete: onTaskComplete,
    });

    $scope.securityGroup = securityGroup;
    ctrl.initializeTargetOptions();
    ctrl.initializeTarget();
    ctrl.onTargetChange();
    ctrl.registerHelpTextService();

    ctrl.upsert = function () {
      $scope.taskMonitor.submit(
        function() {
          return securityGroupWriter.upsertSecurityGroup($scope.securityGroup, application, 'Create');
        }
      );
    };

    ctrl.mixinUpsert = function (descriptor) {
      $scope.taskMonitor.submit(
        function() {
          var allowed = _.map($scope.securityGroup.ipIngress, function(ipIngressRule) {
            var rule = {
              ipProtocol: ipIngressRule.type,
            };

            if (ipIngressRule.startPort && ipIngressRule.endPort) {
              rule.portRanges = [ipIngressRule.startPort + '-' + ipIngressRule.endPort];
            }

            return rule;
          });

          return securityGroupWriter.upsertSecurityGroup($scope.securityGroup, application, descriptor, {
            cloudProvider: 'gce',
            securityGroupName: $scope.securityGroup.name,
            sourceRanges: _.uniq(_.map($scope.securityGroup.sourceRanges, 'value')),
            targetTags: $scope.securityGroup.targetTags,
            sourceTags: $scope.securityGroup.sourceTags,
            allowed: allowed,
            region: 'global',
            network: $scope.securityGroup.network,
          });
        }
      );
    };

    ctrl.accountUpdated = function() {
      ctrl.initializeSecurityGroups();
      ctrl.updateNetworks();
      ctrl.updateName();
    };

    ctrl.refreshSecurityGroups = function() {
      $scope.state.refreshingSecurityGroups = true;
      return cacheInitializer.refreshCache('securityGroups').then(function() {
        return ctrl.initializeSecurityGroups().then(function() {
          $scope.state.refreshingSecurityGroups = false;
        });
      });
    };

    ctrl.initializeSecurityGroups = function() {
      return securityGroupReader.getAllSecurityGroups().then(function (securityGroups) {
        var account = $scope.securityGroup.credentials || $scope.securityGroup.accountName;

        var existingGroups;
        if(account) {
          existingGroups = securityGroups[account].gce.global;
        } else {
          existingGroups = securityGroups;
        }

        $scope.existingSecurityGroupNames = _.map(existingGroups, 'name');
      });
    };

    ctrl.cancel = function() {
      $uibModalInstance.dismiss();
    };

    ctrl.updateNetworks = function() {
      networkReader.listNetworksByProvider('gce').then(function(gceNetworks) {
        var account = $scope.securityGroup.credentials || $scope.securityGroup.accountName;
        $scope.securityGroup.backingData.networks = _(gceNetworks)
            .filter(n => n.account === account && !n.id.includes('/') )
            .map(n => n.id)
            .value();
      });
    };

    ctrl.getCurrentNamePattern = function() {
      return /^[a-zA-Z0-9-]*$/;
    };

    ctrl.updateName = function() {
      var securityGroup = $scope.securityGroup,
        name = application.name;
      if (securityGroup.detail) {
        name += '-' + securityGroup.detail;
        name = _.trimEnd(name, '-');
      }
      securityGroup.name = name;
      $scope.namePreview = name;
    };

    ctrl.namePattern = {
      test: function(name) {
        return ctrl.getCurrentNamePattern().test(name);
      }
    };

    ctrl.addSourceCIDR = function(sourceRanges) {
      sourceRanges.push({value: '0.0.0.0/0'});
    };

    ctrl.removeSourceCIDR = function(sourceRanges, index) {
      sourceRanges.splice(index, 1);
    };

    ctrl.addRule = function(ruleset) {
      ruleset.push({
        type: 'tcp',
        startPort: 7001,
        endPort: 7001,
      });
    };

    ctrl.removeRule = function(ruleset, index) {
      ruleset.splice(index, 1);
    };

    ctrl.dismissRemovedRules = function() {
      $scope.state.removedRules = [];
      v2modalWizardService.markClean('Ingress');
      v2modalWizardService.markComplete('Ingress');
    };

    ctrl.isValid = function() {
      return ($scope.state.target === 'specifyTags' ? $scope.securityGroup.targetTags.length > 0 : true) &&
          $scope.securityGroup.ipIngress.length > 0 &&
          ($scope.securityGroup.sourceTags.length > 0 || $scope.securityGroup.sourceRanges.length > 0);
    };

    ctrl.addTargetTag = function() {
      $scope.securityGroup.targetTags.push('');
    };

    ctrl.removeTargetTag = function(index) {
      $scope.securityGroup.targetTags.splice(index, 1);
    };

    ctrl.addSourceTag = function() {
      $scope.securityGroup.sourceTags.push('');
    };

    ctrl.removeSourceTag = function(index) {
      $scope.securityGroup.sourceTags.splice(index, 1);
    };

  });

