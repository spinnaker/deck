'use strict';

const angular = require('angular');
import _ from 'lodash';

import {
  CONFIRMATION_MODAL_SERVICE,
  ClusterTargetBuilder,
  FirewallLabels,
  NetworkReader,
  ServerGroupReader,
  ServerGroupWarningMessageService,
  SERVER_GROUP_WRITER,
  ServerGroupTemplates,
} from '@spinnaker/core';

require('../configure/serverGroup.configure.gce.module.js');

import './serverGroupDetails.less';

module.exports = angular
  .module('spinnaker.serverGroup.details.gce.controller', [
    require('@uirouter/angularjs').default,
    require('../configure/serverGroupCommandBuilder.service.js').name,
    CONFIRMATION_MODAL_SERVICE,
    SERVER_GROUP_WRITER,
    require('google/common/xpnNaming.gce.service.js').name,
    require('./resize/resizeServerGroup.controller').name,
    require('./rollback/rollbackServerGroup.controller').name,
    require('./autoscalingPolicy/autoscalingPolicy.directive.js').name,
    require('./autoscalingPolicy/addAutoscalingPolicyButton.component.js').name,
  ])
  .controller('gceServerGroupDetailsCtrl', function(
    $scope,
    $state,
    $templateCache,
    $interpolate,
    app,
    serverGroup,
    gceServerGroupCommandBuilder,
    $uibModal,
    confirmationModalService,
    serverGroupWriter,
    gceXpnNamingService,
  ) {
    this.state = {
      loading: true,
    };

    this.firewallsLabel = FirewallLabels.get('Firewalls');

    this.application = app;

    const extractServerGroupSummary = () => {
      let summary = _.find(app.serverGroups.data, toCheck => {
        return (
          toCheck.name === serverGroup.name &&
          toCheck.account === serverGroup.accountId &&
          toCheck.region === serverGroup.region
        );
      });
      if (!summary) {
        app.loadBalancers.data.some(loadBalancer => {
          if (loadBalancer.account === serverGroup.accountId && loadBalancer.region === serverGroup.region) {
            return loadBalancer.serverGroups.some(possibleServerGroup => {
              if (possibleServerGroup.name === serverGroup.name) {
                summary = possibleServerGroup;
                return true;
              }
            });
          }
        });
      }
      return summary;
    };

    const autoClose = () => {
      if ($scope.$$destroyed) {
        return;
      }
      $state.params.allowModalToStayOpen = true;
      $state.go('^', null, { location: 'replace' });
    };

    const cancelLoader = () => {
      this.state.loading = false;
    };

    const retrieveServerGroup = () => {
      const summary = extractServerGroupSummary();
      return ServerGroupReader.getServerGroup(
        app.name,
        serverGroup.accountId,
        serverGroup.region,
        serverGroup.name,
      ).then(details => {
        cancelLoader();

        angular.extend(details, summary);
        // it's possible the summary was not found because the clusters are still loading
        details.account = serverGroup.accountId;

        this.serverGroup = details;

        if (!_.isEmpty(this.serverGroup)) {
          if (details.securityGroups) {
            this.securityGroups = _.chain(details.securityGroups)
              .map(id => {
                return (
                  _.find(app.securityGroups.data, { accountName: serverGroup.accountId, region: 'global', id: id }) ||
                  _.find(app.securityGroups.data, { accountName: serverGroup.accountId, region: 'global', name: id })
                );
              })
              .compact()
              .value();
          }

          this.serverGroup.zones.sort();

          const projectId = gceXpnNamingService.deriveProjectId(this.serverGroup.launchConfig.instanceTemplate);
          this.serverGroup.logsLink =
            'https://console.developers.google.com/project/' +
            projectId +
            '/logs?advancedFilter=resource.type=(gce_instance_group_manager OR gce_instance OR gce_autoscaler)%0A"' +
            this.serverGroup.name +
            '"';

          this.serverGroup.network = getNetwork(projectId);
          retrieveSubnet(projectId);
          determineAssociatePublicIPAddress();

          findStartupScript();
          prepareDiskDescriptions();
          prepareAvailabilityPolicies();
          prepareAutoHealingPolicy();
          prepareAuthScopes();
          prepareCurrentActions();
          augmentTagsWithHelp();
          configureEntityTagTargets();
          processLabels();
        } else {
          autoClose();
        }
      }, autoClose);
    };

    const findStartupScript = () => {
      if (_.has(this.serverGroup, 'launchConfig.instanceTemplate.properties.metadata.items')) {
        const metadataItems = this.serverGroup.launchConfig.instanceTemplate.properties.metadata.items;
        const startupScriptItem = _.find(metadataItems, metadataItem => {
          return metadataItem.key === 'startup-script';
        });

        if (startupScriptItem) {
          this.serverGroup.startupScript = startupScriptItem.value;
        }
      }
    };

    const prepareDiskDescriptions = () => {
      if (_.has(this.serverGroup, 'launchConfig.instanceTemplate.properties.disks')) {
        const diskDescriptions = [];

        this.serverGroup.launchConfig.instanceTemplate.properties.disks.forEach(disk => {
          const diskLabel = disk.initializeParams.diskType + ':' + disk.initializeParams.diskSizeGb;
          const existingDiskDescription = _.find(diskDescriptions, description => {
            return description.bareLabel === diskLabel;
          });

          if (existingDiskDescription) {
            existingDiskDescription.count++;
            existingDiskDescription.countSuffix = ' (×' + existingDiskDescription.count + ')';
            existingDiskDescription.sourceImages = getSourceImage(disk)
              ? [getSourceImage(disk)].concat(existingDiskDescription.sourceImages)
              : existingDiskDescription.sourceImages;
          } else {
            diskDescriptions.push({
              bareLabel: diskLabel,
              count: 1,
              countSuffix: '',
              finalLabel:
                translateDiskType(disk.initializeParams.diskType) + ': ' + disk.initializeParams.diskSizeGb + 'GB',
              sourceImages: getSourceImage(disk) ? [getSourceImage(disk)] : [],
            });
          }
        });

        diskDescriptions.forEach(description => {
          if (!description.sourceImages.length) {
            return;
          }

          description.sourceImages = _.uniq(description.sourceImages);

          switch (description.count) {
            case 0:
              break;
            case 1:
              if (description.sourceImages[0]) {
                description.helpField = `This disk uses the source image <em>${description.sourceImages[0]}</em>.`;
              }
              break;
            default:
              description.helpField = `
                These disks use the following source images:
                <ul>
                  ${description.sourceImages.map(image => `<li><em>${image}</em></li>`).join('')}
                </ul>
              `;
              break;
          }
        });

        this.serverGroup.diskDescriptions = diskDescriptions;
      }
    };

    const getSourceImage = disk => _.last(_.get(disk, 'initializeParams.sourceImage', '').split('/'));

    const prepareAvailabilityPolicies = () => {
      if (_.has(this.serverGroup, 'launchConfig.instanceTemplate.properties.scheduling')) {
        const scheduling = this.serverGroup.launchConfig.instanceTemplate.properties.scheduling;

        this.serverGroup.availabilityPolicies = {
          preemptibility: scheduling.preemptible ? 'On' : 'Off',
          automaticRestart: scheduling.automaticRestart ? 'On' : 'Off',
          onHostMaintenance: scheduling.onHostMaintenance === 'MIGRATE' ? 'Migrate' : 'Terminate',
        };
      }
    };

    const prepareAutoHealingPolicy = () => {
      if (this.serverGroup.autoHealingPolicy) {
        let autoHealingPolicy = this.serverGroup.autoHealingPolicy;
        const healthCheckUrl = autoHealingPolicy.healthCheck;

        this.serverGroup.autoHealingPolicyHealthCheck = healthCheckUrl ? _.last(healthCheckUrl.split('/')) : null;
        this.serverGroup.initialDelaySec = autoHealingPolicy.initialDelaySec;

        if (autoHealingPolicy.maxUnavailable) {
          if (typeof autoHealingPolicy.maxUnavailable.percent === 'number') {
            this.serverGroup.maxUnavailable = autoHealingPolicy.maxUnavailable.percent + '%';
          } else {
            this.serverGroup.maxUnavailable = autoHealingPolicy.maxUnavailable.fixed + ' instances';
          }
        }
      }
    };

    const prepareAuthScopes = () => {
      if (_.has(this.serverGroup, 'launchConfig.instanceTemplate.properties.serviceAccounts')) {
        const serviceAccounts = this.serverGroup.launchConfig.instanceTemplate.properties.serviceAccounts;
        if (serviceAccounts.length) {
          const serviceAccount = this.serverGroup.launchConfig.instanceTemplate.properties.serviceAccounts[0];

          this.serverGroup.serviceAccountEmail = serviceAccount.email;
          this.serverGroup.authScopes = _.map(serviceAccount.scopes, authScope => {
            return authScope.replace('https://www.googleapis.com/auth/', '');
          });
        }
      }
    };

    const prepareCurrentActions = () => {
      if (this.serverGroup.currentActions) {
        this.serverGroup.currentActionsSummary = [];

        _.forOwn(this.serverGroup.currentActions, (value, key) => {
          if (key !== 'none' && value) {
            this.serverGroup.currentActionsSummary.push({ action: _.startCase(key), count: value });
          }
        });

        if (!this.serverGroup.currentActionsSummary.length) {
          delete this.serverGroup.currentActionsSummary;
        }
      }
    };

    const translateDiskType = diskType => {
      if (diskType === 'pd-ssd') {
        return 'Persistent SSD';
      } else if (diskType === 'local-ssd') {
        return 'Local SSD';
      } else {
        return 'Persistent Std';
      }
    };

    const augmentTagsWithHelp = () => {
      if (_.has(this.serverGroup, 'launchConfig.instanceTemplate.properties.tags.items') && this.securityGroups) {
        const helpMap = {};

        this.serverGroup.launchConfig.instanceTemplate.properties.tags.items.forEach(tag => {
          const securityGroupsMatches = _.filter(this.securityGroups, securityGroup =>
            _.includes(securityGroup.targetTags, tag),
          );
          const securityGroupMatchNames = _.map(securityGroupsMatches, 'name');

          if (!_.isEmpty(securityGroupMatchNames)) {
            const groupOrGroups = securityGroupMatchNames.length > 1 ? 'groups' : 'group';

            helpMap[tag] =
              'This tag associates this server group with security ' +
              groupOrGroups +
              ' <em>' +
              securityGroupMatchNames.join(', ') +
              '</em>.';
          }
        });

        this.serverGroup.launchConfig.instanceTemplate.properties.tags.helpMap = helpMap;
      }
    };

    const processLabels = () => {
      if (!_.size(this.serverGroup.instanceTemplateLabels)) {
        delete this.serverGroup.instanceTemplateLabels;
      }
    };

    const getNetwork = projectId => {
      const networkUrl = _.get(
        this.serverGroup,
        'launchConfig.instanceTemplate.properties.networkInterfaces[0].network',
      );
      return gceXpnNamingService.decorateXpnResourceIfNecessary(projectId, networkUrl);
    };

    const retrieveSubnet = projectId => {
      NetworkReader.listNetworksByProvider('gce').then(networks => {
        const autoCreateSubnets = _.chain(networks)
          .filter({ account: this.serverGroup.account, id: this.serverGroup.network })
          .map('autoCreateSubnets')
          .head()
          .value();

        if (autoCreateSubnets) {
          this.serverGroup.subnet = '(Auto-select)';
        } else {
          const subnetUrl = _.get(
            this.serverGroup,
            'launchConfig.instanceTemplate.properties.networkInterfaces[0].subnetwork',
          );
          this.serverGroup.subnet = gceXpnNamingService.decorateXpnResourceIfNecessary(projectId, subnetUrl);
        }
      });
    };

    const determineAssociatePublicIPAddress = () => {
      this.serverGroup.associatePublicIPAddress = _.has(
        this.serverGroup,
        'launchConfig.instanceTemplate.properties.networkInterfaces[0].accessConfigs',
      );
    };

    retrieveServerGroup().then(() => {
      // If the user navigates away from the view before the initial retrieveServerGroup call completes,
      // do not bother subscribing to the refresh
      if (!$scope.$$destroyed) {
        app.serverGroups.onRefresh($scope, retrieveServerGroup);
      }
    });

    this.destroyServerGroup = () => {
      const serverGroup = this.serverGroup;

      const taskMonitor = {
        application: app,
        title: 'Destroying ' + serverGroup.name,
      };

      const submitMethod = params => serverGroupWriter.destroyServerGroup(serverGroup, app, params);

      const stateParams = {
        name: serverGroup.name,
        accountId: serverGroup.account,
        region: serverGroup.region,
      };

      const confirmationModalParams = {
        header: 'Really destroy ' + serverGroup.name + '?',
        buttonText: 'Destroy ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        submitMethod: submitMethod,
        askForReason: true,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Google',
        onTaskComplete: () => {
          if ($state.includes('**.serverGroup', stateParams)) {
            $state.go('^');
          }
        },
      };

      ServerGroupWarningMessageService.addDestroyWarningMessage(app, serverGroup, confirmationModalParams);

      if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
        confirmationModalParams.interestingHealthProviderNames = ['Google'];
      }

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.disableServerGroup = () => {
      const serverGroup = this.serverGroup;

      const taskMonitor = {
        application: app,
        title: 'Disabling ' + serverGroup.name,
      };

      const submitMethod = params => serverGroupWriter.disableServerGroup(serverGroup, app, params);

      const confirmationModalParams = {
        header: 'Really disable ' + serverGroup.name + '?',
        buttonText: 'Disable ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Google',
        submitMethod: submitMethod,
        askForReason: true,
      };

      ServerGroupWarningMessageService.addDisableWarningMessage(app, serverGroup, confirmationModalParams);

      if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
        confirmationModalParams.interestingHealthProviderNames = ['Google'];
      }

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.enableServerGroup = () => {
      const serverGroup = this.serverGroup;

      const taskMonitor = {
        application: app,
        title: 'Enabling ' + serverGroup.name,
      };

      const submitMethod = params => serverGroupWriter.enableServerGroup(serverGroup, app, params);

      const confirmationModalParams = {
        header: 'Really enable ' + serverGroup.name + '?',
        buttonText: 'Enable ' + serverGroup.name,
        account: serverGroup.account,
        taskMonitorConfig: taskMonitor,
        platformHealthOnlyShowOverride: app.attributes.platformHealthOnlyShowOverride,
        platformHealthType: 'Google',
        submitMethod: submitMethod,
        askForReason: true,
      };

      if (app.attributes.platformHealthOnlyShowOverride && app.attributes.platformHealthOnly) {
        confirmationModalParams.interestingHealthProviderNames = ['Google'];
      }

      confirmationModalService.confirm(confirmationModalParams);
    };

    this.rollbackServerGroup = () => {
      $uibModal.open({
        templateUrl: require('./rollback/rollbackServerGroup.html'),
        controller: 'gceRollbackServerGroupCtrl as ctrl',
        resolve: {
          serverGroup: () => this.serverGroup,
          disabledServerGroups: () => {
            const cluster = _.find(app.clusters, { name: this.serverGroup.cluster, account: this.serverGroup.account });
            return _.filter(cluster.serverGroups, { isDisabled: true, region: this.serverGroup.region });
          },
          application: () => app,
        },
      });
    };

    this.resizeServerGroup = () => {
      $uibModal.open({
        templateUrl: require('./resize/resizeServerGroup.html'),
        controller: 'gceResizeServerGroupCtrl as ctrl',
        resolve: {
          serverGroup: () => {
            return this.serverGroup;
          },
          application: () => {
            return app;
          },
        },
      });
    };

    this.cloneServerGroup = serverGroup => {
      $uibModal.open({
        templateUrl: require('../configure/wizard/serverGroupWizard.html'),
        controller: 'gceCloneServerGroupCtrl as ctrl',
        size: 'lg',
        resolve: {
          title: () => {
            return 'Clone ' + serverGroup.name;
          },
          application: () => {
            return app;
          },
          serverGroup: () => {
            return serverGroup;
          },
          serverGroupCommand: () => {
            return gceServerGroupCommandBuilder.buildServerGroupCommandFromExisting(app, serverGroup);
          },
        },
      });
    };

    this.showStartupScript = () => {
      $scope.userDataModalTitle = 'Startup Script';
      $scope.serverGroup = { name: this.serverGroup.name };
      $scope.userData = this.serverGroup.startupScript;
      $uibModal.open({
        templateUrl: ServerGroupTemplates.userData,
        scope: $scope,
      });
    };

    this.buildJenkinsLink = () => {
      if (this.serverGroup && this.serverGroup.buildInfo && this.serverGroup.buildInfo.buildInfoUrl) {
        return this.serverGroup.buildInfo.buildInfoUrl;
      } else if (this.serverGroup && this.serverGroup.buildInfo && this.serverGroup.buildInfo.jenkins) {
        var jenkins = this.serverGroup.buildInfo.jenkins;
        return jenkins.host + 'job/' + jenkins.name + '/' + jenkins.number;
      }
      return null;
    };

    this.truncateCommitHash = () => {
      if (this.serverGroup && this.serverGroup.buildInfo && this.serverGroup.buildInfo.commit) {
        return this.serverGroup.buildInfo.commit.substring(0, 8);
      }
      return null;
    };

    const configureEntityTagTargets = () => {
      this.entityTagTargets = ClusterTargetBuilder.buildClusterTargets(this.serverGroup);
    };
  });
