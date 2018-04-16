'use strict';

const angular = require('angular');
import _ from 'lodash';

import {
  ACCOUNT_SERVICE,
  ClusterTargetBuilder,
  CONFIRMATION_MODAL_SERVICE,
  NameUtils,
  SERVER_GROUP_READER,
  SERVER_GROUP_WARNING_MESSAGE_SERVICE,
  SERVER_GROUP_WRITER,
  SETTINGS,
} from '@spinnaker/core';

import { SCALING_POLICY_MODULE } from './scalingPolicy/scalingPolicy.module';

import { configBinService } from './scalingPolicy/configBin/configBin.reader';
import { CONFIG_BIN_LINK_COMPONENT } from './scalingPolicy/configBin/configBinLink.component';

module.exports = angular
  .module('spinnaker.serverGroup.details.titus.controller', [
    require('../../securityGroup/securityGroup.read.service').name,
    require('@uirouter/angularjs').default,
    ACCOUNT_SERVICE,
    require('../configure/ServerGroupCommandBuilder.js').name,
    SERVER_GROUP_WARNING_MESSAGE_SERVICE,
    SERVER_GROUP_READER,
    CONFIG_BIN_LINK_COMPONENT,
    CONFIRMATION_MODAL_SERVICE,
    SERVER_GROUP_WRITER,
    require('./resize/resizeServerGroup.controller').name,
    require('./rollback/rollbackServerGroup.controller').name,
    SCALING_POLICY_MODULE,
  ])
  .controller('titusServerGroupDetailsCtrl', function(
    $scope,
    $state,
    $templateCache,
    $interpolate,
    app,
    serverGroup,
    titusServerGroupCommandBuilder,
    serverGroupReader,
    $uibModal,
    confirmationModalService,
    serverGroupWriter,
    awsServerGroupTransformer,
    serverGroupWarningMessageService,
    accountService,
    titusSecurityGroupReader,
  ) {
    let application = app;
    this.application = app;

    $scope.gateUrl = SETTINGS.gateUrl;

    $scope.state = {
      loading: true,
    };

    function extractServerGroupSummary() {
      var summary = _.find(application.serverGroups.data, function(toCheck) {
        return (
          toCheck.name === serverGroup.name &&
          toCheck.account === serverGroup.accountId &&
          toCheck.region === serverGroup.region
        );
      });
      return summary;
    }

    function retrieveServerGroup() {
      var summary = extractServerGroupSummary();
      return serverGroupReader
        .getServerGroup(application.name, serverGroup.accountId, serverGroup.region, serverGroup.name)
        .then(function(details) {
          cancelLoader();

          // it's possible the summary was not found because the clusters are still loading
          details.account = serverGroup.accountId;

          accountService.getAccountDetails(details.account).then(accountDetails => {
            details.apiEndpoint = _.filter(accountDetails.regions, { name: details.region })[0].endpoint;
          });

          angular.extend(details, summary);

          $scope.serverGroup = details;
          var labels = $scope.serverGroup.labels;
          delete labels['name'];
          delete labels['source'];
          delete labels['spinnakerAccount'];
          delete labels['NETFLIX_APP_METADATA'];
          delete labels['NETFLIX_APP_METADATA_SIG'];
          $scope.labels = labels;

          transformScalingPolicies(details);

          if (!_.isEmpty($scope.serverGroup)) {
            if (details.securityGroups) {
              $scope.securityGroups = _.chain(details.securityGroups)
                .map(function(id) {
                  return titusSecurityGroupReader.resolveIndexedSecurityGroup(
                    application['securityGroupsIndex'],
                    details,
                    id,
                  );
                })
                .compact()
                .value();
            }
            configureEntityTagTargets();
          } else {
            autoClose();
          }
        }, autoClose);
    }

    $scope.addConfigBinData = () => {
      const cluster = NameUtils.parseServerGroupName($scope.serverGroup.name).cluster;
      configBinService
        .getConfig(cluster)
        .then(config => {
          $scope.configBinData = config;
        })
        .catch(() => {
          /* not found */
        });
    };

    function transformScalingPolicies(serverGroup) {
      serverGroup.scalingPolicies = (serverGroup.scalingPolicies || [])
        .map(p => {
          const { policy } = p;
          const { stepPolicyDescriptor } = policy;
          const policyType = stepPolicyDescriptor ? 'StepScaling' : 'TargetTrackingScaling';
          if (stepPolicyDescriptor) {
            const alarm = stepPolicyDescriptor.alarmConfig;
            alarm.period = alarm.periodSec;
            alarm.namespace = alarm.metricNamespace;
            if (alarm.metricNamespace === 'NFLX/EPIC' && !alarm.dimensions) {
              alarm.dimensions = [{ name: 'AutoScalingGroupName', value: serverGroup.name }];
            }
            if (!alarm.dimensions) {
              alarm.dimensions = [];
            }
            const policy = _.cloneDeep(stepPolicyDescriptor.scalingPolicy);
            policy.cooldown = policy.cooldownSec;
            policy.policyType = policyType;
            policy.alarms = [alarm];
            policy.id = p.id;
            if (policy.stepAdjustments) {
              policy.stepAdjustments.forEach(step => {
                // gRPC currently returns these values in upper camel case
                step.metricIntervalUpperBound = _.get(step, 'metricIntervalUpperBound', step.MetricIntervalUpperBound);
                step.metricIntervalLowerBound = _.get(step, 'metricIntervalLowerBound', step.MetricIntervalLowerBound);
              });
            }
            return policy;
          } else {
            policy.id = p.id;
            policy.targetTrackingConfiguration = policy.targetPolicyDescriptor;
            policy.targetTrackingConfiguration.scaleOutCooldown =
              policy.targetTrackingConfiguration.scaleOutCooldownSec;
            policy.targetTrackingConfiguration.scaleInCooldown = policy.targetTrackingConfiguration.scaleInCooldownSec;
            return policy;
          }
        })
        .map(p => awsServerGroupTransformer.transformScalingPolicy(p));
    }

    function autoClose() {
      if ($scope.$$destroyed) {
        return;
      }
      $state.params.allowModalToStayOpen = true;
      $state.go('^', null, { location: 'replace' });
    }

    function cancelLoader() {
      $scope.state.loading = false;
    }

    retrieveServerGroup()
      .then(() => {
        $scope.addConfigBinData();
        // If the user navigates away from the view before the initial retrieveServerGroup call completes,
        // do not bother subscribing to the refresh
        if (!$scope.$$destroyed) {
          app.serverGroups.onRefresh($scope, retrieveServerGroup);
        }
      })
      .catch(() => {});

    accountService.getAccountDetails(serverGroup.accountId).then(details => {
      const awsAccount = details.awsAccount;
      $scope.titusUiEndpoint = _.filter(details.regions, { name: serverGroup.region })[0].endpoint;
      accountService.getAccountDetails(awsAccount).then(awsDetails => {
        this.awsAccountId = awsDetails.accountId;
        this.env = awsDetails.environment;
      });
      if (
        details.autoscalingEnabled &&
        details.regions.some(r => r.name === serverGroup.region && r.autoscalingEnabled)
      ) {
        this.scalingPoliciesEnabled = true;
      }
    });

    let configureEntityTagTargets = () => {
      this.entityTagTargets = ClusterTargetBuilder.buildClusterTargets($scope.serverGroup);
    };

    this.destroyServerGroup = function destroyServerGroup() {
      var serverGroup = $scope.serverGroup;

      var taskMonitor = {
        application: application,
        title: 'Destroying ' + serverGroup.name,
      };

      var submitMethod = function() {
        return serverGroupWriter.destroyServerGroup(serverGroup, application, {
          cloudProvider: 'titus',
          serverGroupName: serverGroup.name,
          region: serverGroup.region,
        });
      };

      var stateParams = {
        name: serverGroup.name,
        accountId: serverGroup.account,
        region: serverGroup.region,
      };

      var confirmationModalParams = {
        header: 'Really destroy ' + serverGroup.name + '?',
        buttonText: 'Destroy ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Titus',
        submitMethod: submitMethod,
        onTaskComplete: function() {
          if ($state.includes('**.serverGroup', stateParams)) {
            $state.go('^');
          }
        },
      };

      serverGroupWarningMessageService.addDestroyWarningMessage(app, serverGroup, confirmationModalParams);

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.disableServerGroup = function disableServerGroup() {
      var serverGroup = $scope.serverGroup;

      var taskMonitor = {
        application: application,
        title: 'Disabling ' + serverGroup.name,
      };

      var submitMethod = function() {
        return serverGroupWriter.disableServerGroup(serverGroup, application, {
          cloudProvider: 'titus',
          serverGroupName: serverGroup.name,
          region: serverGroup.region,
          zone: serverGroup.zones[0],
        });
      };

      var confirmationModalParams = {
        header: 'Really disable ' + serverGroup.name + '?',
        buttonText: 'Disable ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Titus',
        submitMethod: submitMethod,
      };

      serverGroupWarningMessageService.addDisableWarningMessage(app, serverGroup, confirmationModalParams);

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.enableServerGroup = () => {
      if (!this.isRollbackEnabled()) {
        this.showEnableServerGroupModal();
        return;
      }

      const confirmationModalParams = {
        header: 'Rolling back?',
        body: `Spinnaker provides an orchestrated rollback feature to carefully restore a different version of this
             server group. Do you want to use the orchestrated rollback?`,
        buttonText: `Yes, let's start the orchestrated rollback`,
        cancelButtonText: 'No, I just want to enable the server group',
      };

      confirmationModalService
        .confirm(confirmationModalParams)
        .then(() => this.rollbackServerGroup())
        .catch(({ source }) => {
          // don't show the enable modal if the user cancels with the header button
          if (source === 'footer') {
            this.showEnableServerGroupModal();
          }
        });
    };

    this.showEnableServerGroupModal = () => {
      var serverGroup = $scope.serverGroup;

      var taskMonitor = {
        application: application,
        title: 'Enabling ' + serverGroup.name,
      };

      var submitMethod = function() {
        return serverGroupWriter.enableServerGroup(serverGroup, application, {
          cloudProvider: 'titus',
          serverGroupName: serverGroup.name,
          region: serverGroup.region,
          zone: serverGroup.zones[0],
        });
      };

      var confirmationModalParams = {
        header: 'Really enable ' + serverGroup.name + '?',
        buttonText: 'Enable ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Titus',
        submitMethod: submitMethod,
      };

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.resizeServerGroup = function resizeServerGroup() {
      $uibModal.open({
        templateUrl: require('./resize/resizeServerGroup.html'),
        controller: 'titusResizeServerGroupCtrl as ctrl',
        resolve: {
          serverGroup: function() {
            return $scope.serverGroup;
          },
          application: function() {
            return application;
          },
        },
      });
    };

    this.cloneServerGroup = function cloneServerGroup() {
      var serverGroup = $scope.serverGroup;
      $uibModal.open({
        templateUrl: require('../configure/wizard/serverGroupWizard.html'),
        controller: 'titusCloneServerGroupCtrl as ctrl',
        size: 'lg',
        resolve: {
          title: function() {
            return 'Clone ' + serverGroup.name;
          },
          application: function() {
            return application;
          },
          serverGroup: function() {
            return serverGroup;
          },
          serverGroupCommand: function() {
            return titusServerGroupCommandBuilder.buildServerGroupCommandFromExisting(application, serverGroup);
          },
        },
      });
    };

    this.isRollbackEnabled = function rollbackServerGroup() {
      let serverGroup = $scope.serverGroup;
      if (!serverGroup.isDisabled) {
        // enabled server groups are always a candidate for rollback
        return true;
      }

      // if the server group selected for rollback is disabled, ensure that at least one enabled server group exists
      return application
        .getDataSource('serverGroups')
        .data.some(
          g =>
            g.cluster === serverGroup.cluster &&
            g.region === serverGroup.region &&
            g.account === serverGroup.account &&
            g.isDisabled === false,
        );
    };

    this.rollbackServerGroup = function rollbackServerGroup() {
      let serverGroup = $scope.serverGroup;

      let previousServerGroup;
      let allServerGroups = app
        .getDataSource('serverGroups')
        .data.filter(
          g =>
            g.cluster === serverGroup.cluster && g.region === serverGroup.region && g.account === serverGroup.account,
        );

      if (serverGroup.isDisabled) {
        // if the selected server group is disabled, it represents the server group that should be _rolled back to_
        previousServerGroup = serverGroup;

        /*
         * Find an existing server group to rollback, prefer the largest enabled server group.
         *
         * isRollbackEnabled() ensures that at least one enabled server group exists.
         */
        serverGroup = _.orderBy(
          allServerGroups.filter(g => g.name !== previousServerGroup.name && !g.isDisabled),
          ['instanceCounts.total', 'createdTime'],
          ['desc', 'desc'],
        )[0];
      }

      // the set of all server groups should not include the server group selected for rollback
      allServerGroups = allServerGroups.filter(g => g.name !== serverGroup.name);

      if (allServerGroups.length === 1 && !previousServerGroup) {
        // if there is only one other server group, default to it being the rollback target
        previousServerGroup = allServerGroups[0];
      }

      $uibModal.open({
        templateUrl: require('./rollback/rollbackServerGroup.html'),
        controller: 'titusRollbackServerGroupCtrl as ctrl',
        resolve: {
          serverGroup: () => serverGroup,
          previousServerGroup: () => previousServerGroup,
          disabledServerGroups: () => {
            var cluster = _.find(application.clusters, { name: serverGroup.cluster, account: serverGroup.account });
            return _.filter(cluster.serverGroups, { isDisabled: true, region: serverGroup.region });
          },
          allServerGroups: () => allServerGroups,
          application: () => application,
        },
      });
    };
  });
