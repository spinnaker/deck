'use strict';

import _ from 'lodash';
let angular = require('angular');

import {ACCOUNT_SERVICE} from 'core/account/account.service';
import {CLOUD_PROVIDER_REGISTRY} from 'core/cloudProvider/cloudProvider.registry';
import {CONFIRMATION_MODAL_SERVICE} from 'core/confirmationModal/confirmationModal.service';
import {SECURITY_GROUP_READER} from 'core/securityGroup/securityGroupReader.service';
import {SECURITY_GROUP_WRITER} from 'core/securityGroup/securityGroupWriter.service';

module.exports = angular.module('spinnaker.securityGroup.gce.details.controller', [
  require('angular-ui-router'),
  ACCOUNT_SERVICE,
  SECURITY_GROUP_READER,
  SECURITY_GROUP_WRITER,
  CONFIRMATION_MODAL_SERVICE,
  require('../clone/cloneSecurityGroup.controller.js'),
  require('core/utils/selectOnDblClick.directive.js'),
  CLOUD_PROVIDER_REGISTRY,
])
  .controller('gceSecurityGroupDetailsCtrl', function ($scope, $state, resolvedSecurityGroup, accountService, app,
                                                    confirmationModalService, securityGroupWriter, securityGroupReader,
                                                    $uibModal, cloudProviderRegistry) {

    const application = this.application = app;
    const securityGroup = resolvedSecurityGroup;

    // needed for standalone instances
    $scope.detailsTemplateUrl = cloudProviderRegistry.getValue('gce', 'securityGroup.detailsTemplateUrl');

    $scope.state = {
      loading: true,
      standalone: app.isStandalone,
    };

    function extractSecurityGroup() {
      return securityGroupReader.getSecurityGroupDetails(application, securityGroup.accountId, securityGroup.provider, securityGroup.region, securityGroup.vpcId, securityGroup.name).then(function (details) {
        $scope.state.loading = false;

        if (!details || _.isEmpty( details )) {
          fourOhFour();
        } else {
          $scope.securityGroup = details;
          let applicationSecurityGroup = securityGroupReader
            .getApplicationSecurityGroup(application, securityGroup.accountId, securityGroup.region, securityGroup.name);
          $scope.securityGroup = angular.extend(_.cloneDeep(applicationSecurityGroup), $scope.securityGroup);

          $scope.securityGroup.sourceRanges = _.uniq(
            _.map($scope.securityGroup.ipRangeRules, (rule) => rule.range.ip + rule.range.cidr)
          );

          let ipIngress = _.map($scope.securityGroup.ipRangeRules, function(ipRangeRule) {
            return {
              protocol: ipRangeRule.protocol,
              portRanges: ipRangeRule.portRanges,
            };
          });

          let ipIngressRules = {};

          ipIngress.forEach(function(ipIngressRule) {
            if (_.has(ipIngressRules, ipIngressRule.protocol)) {
              ipIngressRules[ipIngressRule.protocol] = ipIngressRules[ipIngressRule.protocol].concat(ipIngressRule.portRanges);

              ipIngressRules[ipIngressRule.protocol] = _.uniqBy(ipIngressRules[ipIngressRule.protocol], function(portRange) {
                return portRange.startPort + '->' + portRange.endPort;
              });
            } else {
              ipIngressRules[ipIngressRule.protocol] = ipIngressRule.portRanges;
            }
          });

          ipIngressRules = _.map(ipIngressRules, function(portRanges, protocol) {
            return {
              protocol: protocol,
              portRanges: portRanges,
            };
          });

          $scope.securityGroup.ipIngressRules = ipIngressRules;

          $scope.securityGroup.protocolPortRangeCount = _.sumBy(ipIngressRules, function(ipIngressRule) {
            return ipIngressRule.portRanges.length > 1 ? ipIngressRule.portRanges.length : 1;
          });

          if ($scope.securityGroup.targetTags) {
            $scope.securityGroup.targetTagsDescription = $scope.securityGroup.targetTags.join(', ');
          }

          accountService.getAccountDetails(securityGroup.accountId).then(function(accountDetails) {
            $scope.securityGroup.logsLink =
              'https://console.developers.google.com/project/' + accountDetails.project + '/logs?service=gce_firewall_rule&minLogLevel=0&filters=text:' + securityGroup.name;
          });
        }
      },
        fourOhFour
      );
    }

    function fourOhFour() {
      if ($scope.$$destroyed) {
        return;
      }
      $state.params.allowModalToStayOpen = true;
      $state.go('^', null, {location: 'replace'});
    }

    application.securityGroups.ready()
      .then(() => extractSecurityGroup())
      .then(() => {
        // If the user navigates away from the view before the initial extractSecurityGroup call completes,
        // do not bother subscribing to the refresh
        if (!$scope.$$destroyed && !app.isStandalone) {
          app.securityGroups.onRefresh($scope, extractSecurityGroup);
        }
      });

    this.editInboundRules = function editInboundRules() {
      $uibModal.open({
        templateUrl: require('../configure/editSecurityGroup.html'),
        controller: 'gceEditSecurityGroupCtrl as ctrl',
        size: 'lg',
        resolve: {
          securityGroup: function() {
            return angular.copy($scope.securityGroup);
          },
          application: function() { return application; }
        }
      });
    };


    this.cloneSecurityGroup = function cloneSecurityGroup() {
      $uibModal.open({
        templateUrl: require('../clone/cloneSecurityGroup.html'),
        controller: 'gceCloneSecurityGroupController as ctrl',
        size: 'lg',
        resolve: {
          securityGroup: function() {
            var securityGroup = angular.copy($scope.securityGroup);
            if(securityGroup.region) {
              securityGroup.regions = [securityGroup.region];
            }
            return securityGroup;
          },
          application: function() { return application; }
        }
      });
    };

    this.deleteSecurityGroup = function deleteSecurityGroup() {
      var taskMonitor = {
        application: application,
        title: 'Deleting ' + securityGroup.name,
      };

      var submitMethod = function () {
        return securityGroupWriter.deleteSecurityGroup(securityGroup, application, {
          cloudProvider: $scope.securityGroup.type,
          securityGroupName: securityGroup.name,
        });
      };

      confirmationModalService.confirm({
        header: 'Really delete ' + securityGroup.name + '?',
        buttonText: 'Delete ' + securityGroup.name,
        provider: 'gce',
        account: securityGroup.accountId,
        applicationName: application.name,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    if (app.isStandalone) {
      // we still want the edit to refresh the security group details when the modal closes
      app.securityGroups = {
        refresh: extractSecurityGroup
      };
    }
  }
);
