'use strict';

const angular = require('angular');
import _ from 'lodash';

import { AccountService, INSTANCE_TYPE_SERVICE, NameUtils, SubnetReader } from '@spinnaker/core';

import { TencentProviderSettings } from '../../tencent.settings';
import { TENCENT_SERVER_GROUP_CONFIGURATION_SERVICE } from 'tencent/serverGroup/configure/serverGroupConfiguration.service';

module.exports = angular
  .module('spinnaker.tencent.serverGroupCommandBuilder.service', [
    INSTANCE_TYPE_SERVICE,
    TENCENT_SERVER_GROUP_CONFIGURATION_SERVICE,
  ])
  .factory('tencentServerGroupCommandBuilder', [
    '$q',
    'instanceTypeService',
    'tencentServerGroupConfigurationService',
    function($q, instanceTypeService, tencentServerGroupConfigurationService) {
      function buildNewServerGroupCommand(application, defaults) {
        defaults = defaults || {};
        var credentialsLoader = AccountService.getCredentialsKeyedByAccount('tencent');

        var defaultCredentials =
          defaults.account || application.defaultCredentials.tencent || TencentProviderSettings.defaults.account;
        var defaultRegion =
          defaults.region || application.defaultRegions.tencent || TencentProviderSettings.defaults.region;
        var defaultSubnet = defaults.subnet || TencentProviderSettings.defaults.subnetType || '';

        var preferredZonesLoader = AccountService.getAvailabilityZonesForAccountAndRegion(
          'tencent',
          defaultCredentials,
          defaultRegion,
        );

        return $q
          .all({
            preferredZones: preferredZonesLoader,
            credentialsKeyedByAccount: credentialsLoader,
          })
          .then(function(asyncData) {
            var availabilityZones = asyncData.preferredZones;

            var credentials = asyncData.credentialsKeyedByAccount[defaultCredentials];
            var keyPair = credentials ? credentials.defaultKeyPair : null;
            var applicationTencentSettings = _.get(application, 'attributes.providerSettings.tencent', {});

            var useAmiBlockDeviceMappings = applicationTencentSettings.useAmiBlockDeviceMappings || false;

            var command = {
              application: application.name,
              credentials: defaultCredentials,
              region: defaultRegion,
              strategy: '',
              capacity: {
                min: 1,
                max: 1,
                desired: 1,
              },
              targetHealthyDeployPercentage: 100,
              cooldown: 10,
              enabledMetrics: [],
              enhancedService: {
                monitorService: {
                  enabled: true,
                },
                securityService: {
                  enabled: true,
                },
              },
              ebsOptimized: false,
              selectedProvider: 'tencent',
              terminationPolicies: [],
              vpcId: null,
              subnetIds: [],
              subnetType: defaultSubnet,
              availabilityZones: availabilityZones,
              keyPair: keyPair,
              suspendedProcesses: [],
              securityGroups: [],
              stack: '',
              detail: '',
              tags: {},
              useAmiBlockDeviceMappings: useAmiBlockDeviceMappings,
              copySourceCustomBlockDeviceMappings: false, // default to using block device mappings from current instance type
              viewState: {
                instanceProfile: 'custom',
                useAllImageSelection: false,
                useSimpleCapacity: true,
                usePreferredZones: true,
                mode: defaults.mode || 'create',
                disableStrategySelection: true,
                dirty: {},
                submitButtonLabel: getSubmitButtonLabel(defaults.mode || 'create'),
              },
              forwardLoadBalancers: [],
              internetAccessible: {
                internetChargeType: 'TRAFFIC_POSTPAID_BY_HOUR',
                internetMaxBandwidthOut: 1,
                publicIpAssigned: true,
              },
              systemDisk: {
                diskType: 'CLOUD_PREMIUM',
                diskSize: 50,
              },
              dataDisks: [],
              weight: 10,
              userData: '',
            };

            if (
              application.attributes &&
              application.attributes.platformHealthOnlyShowOverride &&
              application.attributes.platformHealthOnly
            ) {
              command.interestingHealthProviderNames = ['Tencent'];
            }

            return command;
          });
      }

      function buildServerGroupCommandFromPipeline(application, originalCluster) {
        var pipelineCluster = _.cloneDeep(originalCluster);
        var region = pipelineCluster.region;
        var instanceTypeCategoryLoader = instanceTypeService.getCategoryForInstanceType(
          'tencent',
          pipelineCluster.instanceType,
        );
        var commandOptions = { account: pipelineCluster.account, region: region };
        var asyncLoader = $q.all({
          command: buildNewServerGroupCommand(application, commandOptions),
          instanceProfile: instanceTypeCategoryLoader,
        });

        return asyncLoader.then(function(asyncData) {
          var command = asyncData.command;

          var viewState = {
            instanceProfile: asyncData.instanceProfile,
            disableImageSelection: true,
            useSimpleCapacity:
              pipelineCluster.minSize === pipelineCluster.maxSize && pipelineCluster.useSourceCapacity !== true,
            usePreferredZones: true,
            mode: 'editPipeline',
            submitButtonLabel: 'Done',
            templatingEnabled: true,
            existingPipelineCluster: true,
            dirty: {},
          };
          var viewOverrides = {
            region: region,
            credentials: pipelineCluster.account || pipelineCluster.accountName,
            availabilityZones: [],
            viewState: viewState,
            securityGroups: pipelineCluster.securityGroupIds,
            tags:
              pipelineCluster.instanceTags && pipelineCluster.instanceTags.length
                ? pipelineCluster.instanceTags.reduce((pre, current) => {
                    pre[current.key] = current.value;
                    return pre;
                  }, {})
                : {},
          };

          pipelineCluster.strategy = pipelineCluster.strategy || '';

          return angular.extend({}, command, pipelineCluster, viewOverrides);
        });
      }

      // Only used to prepare view requiring template selecting
      function buildNewServerGroupCommandForPipeline() {
        return $q.when({
          viewState: {
            requiresTemplateSelection: true,
          },
        });
      }

      function getSubmitButtonLabel(mode) {
        switch (mode) {
          case 'createPipeline':
            return 'Add';
          case 'editPipeline':
            return 'Done';
          case 'clone':
            return 'Clone';
          default:
            return 'Create';
        }
      }

      function buildUpdateServerGroupCommand(serverGroup) {
        var command = {
          type: 'modifyAsg',
          asgs: [{ asgName: serverGroup.name, region: serverGroup.region }],
          cooldown: serverGroup.asg.defaultCooldown,
          enabledMetrics: _.get(serverGroup, 'asg.enabledMetrics', []).map(m => m.metric),
          terminationPolicies: angular.copy(serverGroup.asg.terminationPolicies),
          credentials: serverGroup.account,
        };
        tencentServerGroupConfigurationService.configureUpdateCommand(command);
        return command;
      }

      function buildServerGroupCommandFromExisting(application, serverGroup, mode = 'clone') {
        var preferredZonesLoader = AccountService.getPreferredZonesByAccount('tencent');
        var subnetsLoader = SubnetReader.listSubnets();

        var serverGroupName = NameUtils.parseServerGroupName(serverGroup.asg.autoScalingGroupName);

        var instanceType = serverGroup.launchConfig ? serverGroup.launchConfig.instanceType : null;
        var instanceTypeCategoryLoader = instanceTypeService.getCategoryForInstanceType('tencent', instanceType);

        var asyncLoader = $q.all({
          preferredZones: preferredZonesLoader,
          subnets: subnetsLoader,
          instanceProfile: instanceTypeCategoryLoader,
        });

        return asyncLoader.then(function(asyncData) {
          // These processes should never be copied over, as the affect launching instances and enabling traffic
          let enabledProcesses = ['Launch', 'Terminate', 'AddToLoadBalancer'];

          var applicationTencentSettings = _.get(application, 'attributes.providerSettings.tencent', {});
          var useAmiBlockDeviceMappings = applicationTencentSettings.useAmiBlockDeviceMappings || false;

          const existingTags = {};
          // These tags are applied by Clouddriver (if configured to do so), regardless of what the user might enter
          // Might be worth feature flagging this if it turns out other folks are hard-coding these values
          const reservedTags = [
            'spinnaker:application',
            'spinnaker:stack',
            'spinnaker:details',
            'spinnaker:server-group-name',
          ];
          if (serverGroup.launchConfig.instanceTags) {
            serverGroup.launchConfig.instanceTags
              .filter(t => !reservedTags.includes(t.key))
              .forEach(tag => {
                existingTags[tag.key] = tag.value;
              });
          }
          var command = {
            application: application.name,
            strategy: '',
            stack: serverGroupName.stack,
            detail: serverGroupName.detail || serverGroupName.freeFormDetails,
            credentials: serverGroup.account,
            cooldown: serverGroup.asg.defaultCooldown,
            enabledMetrics: _.get(serverGroup, 'asg.enabledMetrics', []).map(m => m.metric),
            terminationPolicies: serverGroup.asg.terminationPolicySet,
            loadBalancers: serverGroup.asg.loadBalancerNames,
            loadBalancerId:
              serverGroup.loadBalancers && serverGroup.loadBalancers.length && serverGroup.loadBalancers[0],
            forwardLoadBalancers: serverGroup.asg.forwardLoadBalancerSet,
            region: serverGroup.region,
            useSourceCapacity: false,
            capacity: {
              min: serverGroup.asg.minSize,
              max: serverGroup.asg.maxSize,
              desired: serverGroup.asg.desiredCapacity,
            },
            targetHealthyDeployPercentage: 100,
            availabilityZones: [],
            selectedProvider: 'tencent',
            source: {
              account: serverGroup.account,
              region: serverGroup.region,
              serverGroupName: serverGroup.asg.autoScalingGroupName,
            },
            suspendedProcesses: (serverGroup.asg.suspendedProcesses || [])
              .map(process => process.processName)
              .filter(name => !enabledProcesses.includes(name)),
            tags: Object.assign({}, serverGroup.tags, existingTags),
            targetGroups: serverGroup.targetGroups,
            useAmiBlockDeviceMappings: useAmiBlockDeviceMappings,
            copySourceCustomBlockDeviceMappings: mode === 'clone', // default to using block device mappings if not cloning
            viewState: {
              instanceProfile: asyncData.instanceProfile,
              useAllImageSelection: false,
              useSimpleCapacity: serverGroup.asg.minSize === serverGroup.asg.maxSize,
              usePreferredZones: [],
              mode: mode,
              submitButtonLabel: getSubmitButtonLabel(mode),
              isNew: false,
              dirty: {},
            },
          };

          if (
            application.attributes &&
            application.attributes.platformHealthOnlyShowOverride &&
            application.attributes.platformHealthOnly
          ) {
            command.interestingHealthProviderNames = ['Tencent'];
          }

          if (mode === 'editPipeline') {
            command.useSourceCapacity = true;
            command.viewState.useSimpleCapacity = false;
            command.strategy = 'redblack';
            command.suspendedProcesses = [];
          }

          command.subnetIds = serverGroup.asg && serverGroup.asg.subnetIdSet;
          command.vpcId = serverGroup.asg.vpcId;

          if (serverGroup.launchConfig) {
            angular.extend(command, {
              instanceType: serverGroup.launchConfig.instanceType,
              keyPair:
                serverGroup.launchConfig.loginSettings.keyIds && serverGroup.launchConfig.loginSettings.keyIds[0],
              associatePublicIpAddress: serverGroup.launchConfig.internetAccessible.publicIpAssigned,
              ramdiskId: serverGroup.launchConfig.ramdiskId,
              enhancedService: serverGroup.launchConfig.enhancedService,
              ebsOptimized: serverGroup.launchConfig.ebsOptimized,
              internetAccessible: serverGroup.launchConfig.internetAccessible,
              systemDisk: serverGroup.launchConfig.systemDisk,
              dataDisks: serverGroup.launchConfig.dataDisks,
            });
            if (serverGroup.launchConfig.userData) {
              command.userData = serverGroup.launchConfig.userData;
            }
            command.viewState.imageId = serverGroup.launchConfig.imageId;
          }

          if (mode === 'clone' && serverGroup.image && serverGroup.image.name) {
            command.amiName = serverGroup.image.imageId;
          }

          if (serverGroup.launchConfig && serverGroup.launchConfig.securityGroupIds.length) {
            command.securityGroups = serverGroup.launchConfig.securityGroupIds;
          }
          return command;
        });
      }

      return {
        buildNewServerGroupCommand: buildNewServerGroupCommand,
        buildServerGroupCommandFromExisting: buildServerGroupCommandFromExisting,
        buildNewServerGroupCommandForPipeline: buildNewServerGroupCommandForPipeline,
        buildServerGroupCommandFromPipeline: buildServerGroupCommandFromPipeline,
        buildUpdateServerGroupCommand: buildUpdateServerGroupCommand,
      };
    },
  ]);
