'use strict';

import * as angular from 'angular';
import _ from 'lodash';

import {
  CloudProviderRegistry,
  ConfirmationModalService,
  FirewallLabels,
  SECURITY_GROUP_READER,
  SecurityGroupWriter,
  ServerGroupTemplates,
  ProviderSelectionService,
} from '@spinnaker/core';
import UIROUTER_ANGULARJS from '@uirouter/angularjs';

export const KUBERNETES_V1_SECURITYGROUP_DETAILS_DETAILS_CONTROLLER =
  'spinnaker.securityGroup.kubernetes.details.controller';
export const name = KUBERNETES_V1_SECURITYGROUP_DETAILS_DETAILS_CONTROLLER; // for backwards compatibility
angular
  .module(KUBERNETES_V1_SECURITYGROUP_DETAILS_DETAILS_CONTROLLER, [UIROUTER_ANGULARJS, SECURITY_GROUP_READER])
  .controller('kubernetesSecurityGroupDetailsController', [
    '$scope',
    '$state',
    'resolvedSecurityGroup',
    'app',
    'securityGroupReader',
    '$uibModal',
    function($scope, $state, resolvedSecurityGroup, app, securityGroupReader, $uibModal) {
      const application = app;
      const securityGroup = resolvedSecurityGroup;

      // needed for standalone instances
      $scope.detailsTemplateUrl = CloudProviderRegistry.getValue('kubernetes', 'securityGroup.detailsTemplateUrl');

      $scope.firewallLabel = FirewallLabels.get('Firewall');
      $scope.isDisabled = ProviderSelectionService.hideK8InfraButton(application);
      $scope.state = {
        loading: true,
        standalone: app.isStandalone,
      };

      function extractSecurityGroup() {
        return securityGroupReader
          .getSecurityGroupDetails(
            application,
            securityGroup.accountId,
            securityGroup.provider,
            securityGroup.region,
            securityGroup.vpcId,
            securityGroup.name,
          )
          .then(function(details) {
            $scope.state.loading = false;

            if (!details || _.isEmpty(details)) {
              autoClose();
            } else {
              $scope.securityGroup = details;

              // Change TLS hosts from array to string for the UI
              for (const idx in $scope.securityGroup.tls) {
                const tls = $scope.securityGroup.tls[idx];
                tls.hosts = tls.hosts[0];
              }
            }
          }, autoClose);
      }

      this.showYaml = function showYaml() {
        $scope.userDataModalTitle = 'Ingress YAML';
        $scope.userData = $scope.securityGroup.yaml;
        $uibModal.open({
          templateUrl: ServerGroupTemplates.userData,
          scope: $scope,
        });
      };

      function autoClose() {
        if ($scope.$$destroyed) {
          return;
        }
        $state.go('^', { allowModalToStayOpen: true }, { location: 'replace' });
      }

      extractSecurityGroup().then(() => {
        // If the user navigates away from the view before the initial extractSecurityGroup call completes,
        // do not bother subscribing to the refresh
        if (!$scope.$$destroyed && !app.isStandalone) {
          app.securityGroups.onRefresh($scope, extractSecurityGroup);
        }
      });

      this.editSecurityGroup = function editSecurityGroup() {
        $uibModal.open({
          templateUrl: require('../configure/wizard/editWizard.html'),
          controller: 'kubernetesUpsertSecurityGroupController as ctrl',
          size: 'lg',
          resolve: {
            securityGroup: function() {
              const securityGroup = angular.copy($scope.securityGroup.description);
              securityGroup.account = $scope.securityGroup.accountName;
              securityGroup.edit = true;
              return securityGroup;
            },
            application: function() {
              return application;
            },
          },
        });
      };

      this.deleteSecurityGroup = function deleteSecurityGroup() {
        const taskMonitor = {
          application: application,
          title: 'Deleting ' + securityGroup.name,
        };

        const submitMethod = function() {
          return SecurityGroupWriter.deleteSecurityGroup(securityGroup, application, {
            cloudProvider: $scope.securityGroup.type,
            securityGroupName: securityGroup.name,
            namespace: $scope.securityGroup.region,
          });
        };

        ConfirmationModalService.confirm({
          header: 'Really delete ' + securityGroup.name + '?',
          buttonText: 'Delete ' + securityGroup.name,
          account: securityGroup.accountId,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      if (app.isStandalone) {
        app.securityGroups = {
          refresh: extractSecurityGroup,
        };
      }
    },
  ]);
