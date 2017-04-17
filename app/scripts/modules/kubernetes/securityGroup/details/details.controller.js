'use strict';

import _ from 'lodash';
let angular = require('angular');

import {ACCOUNT_SERVICE} from 'core/account/account.service';
import {CLOUD_PROVIDER_REGISTRY} from 'core/cloudProvider/cloudProvider.registry';
import {CONFIRMATION_MODAL_SERVICE} from 'core/confirmationModal/confirmationModal.service';
import {SECURITY_GROUP_READER} from 'core/securityGroup/securityGroupReader.service';
import {SECURITY_GROUP_WRITER} from 'core/securityGroup/securityGroupWriter.service';

module.exports = angular.module('spinnaker.securityGroup.kubernetes.details.controller', [
  require('angular-ui-router'),
  ACCOUNT_SERVICE,
  SECURITY_GROUP_READER,
  SECURITY_GROUP_WRITER,
  CONFIRMATION_MODAL_SERVICE,
  require('core/utils/selectOnDblClick.directive.js'),
  CLOUD_PROVIDER_REGISTRY,
])
  .controller('kubernetesSecurityGroupDetailsController', function ($scope, $state, resolvedSecurityGroup, accountService, app,
                                                    confirmationModalService, securityGroupWriter, securityGroupReader,
                                                    $uibModal, cloudProviderRegistry) {

    const application = app;
    const securityGroup = resolvedSecurityGroup;

    // needed for standalone instances
    $scope.detailsTemplateUrl = cloudProviderRegistry.getValue('kubernetes', 'securityGroup.detailsTemplateUrl');

    $scope.state = {
      loading: true,
      standalone: app.isStandalone,
    };

    function extractSecurityGroup() {
      return securityGroupReader.getSecurityGroupDetails(application, securityGroup.accountId, securityGroup.provider, securityGroup.region, securityGroup.vpcId, securityGroup.name).then(function (details) {
        $scope.state.loading = false;

        if (!details || _.isEmpty(details)) {
          autoClose();
        } else {
          $scope.securityGroup = details;
        }
      },
        autoClose
      );
    }

    this.showYaml = function showYaml() {
      $scope.userDataModalTitle = 'Ingress YAML';
      $scope.userData = $scope.securityGroup.yaml;
      $uibModal.open({
        templateUrl: require('core/serverGroup/details/userData.html'),
        controller: 'CloseableModalCtrl',
        scope: $scope
      });
    };

    function autoClose() {
      if ($scope.$$destroyed) {
        return;
      }
      $state.params.allowModalToStayOpen = true;
      $state.go('^', null, {location: 'replace'});
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
            var securityGroup = angular.copy($scope.securityGroup.description);
            securityGroup.account = $scope.securityGroup.account;
            securityGroup.edit = true;
            return securityGroup;
          },
          application: function() {
            return application;
          }
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
          namespace: $scope.securityGroup.region,
        });
      };

      confirmationModalService.confirm({
        header: 'Really delete ' + securityGroup.name + '?',
        buttonText: 'Delete ' + securityGroup.name,
        provider: 'kubernetes',
        account: securityGroup.accountId,
        applicationName: application.name,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod
      });
    };

    if (app.isStandalone) {
      app.securityGroups = {
        refresh: extractSecurityGroup
      };
    }
  });
