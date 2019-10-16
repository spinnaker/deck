'use strict';

const angular = require('angular');
import _ from 'lodash';

import { AccountService, INSTANCE_TYPE_SERVICE } from '@spinnaker/core';

import { ECS_SERVER_GROUP_CONFIGURATION_SERVICE } from './serverGroupConfiguration.service';

module.exports = angular
  .module('spinnaker.ecs.serverGroupCommandBuilder.service', [
    INSTANCE_TYPE_SERVICE,
    ECS_SERVER_GROUP_CONFIGURATION_SERVICE,
  ])
  .factory('ecsServerGroupCommandBuilder', [
    '$q',
    'instanceTypeService',
    'ecsServerGroupConfigurationService',
    function($q, instanceTypeService, ecsServerGroupConfigurationService) {
      function reconcileUpstreamImages(image, upstreamImages) {
        if (image.fromContext) {
          let matchingImage = upstreamImages.find(otherImage => image.stageId === otherImage.stageId);

          if (matchingImage) {
            image.cluster = matchingImage.cluster;
            image.pattern = matchingImage.pattern;
            image.repository = matchingImage.repository;
            return image;
          } else {
            return null;
          }
        } else if (image.fromTrigger) {
          let matchingImage = upstreamImages.find(otherImage => {
            return (
              image.registry === otherImage.registry &&
              image.repository === otherImage.repository &&
              image.tag === otherImage.tag
            );
          });

          if (matchingImage) {
            return image;
          } else {
            return null;
          }
        } else {
          return image;
        }
      }

      function findUpstreamImages(current, all, visited = {}) {
        // This actually indicates a loop in the stage dependencies.
        if (visited[current.refId]) {
          return [];
        } else {
          visited[current.refId] = true;
        }
        let result = [];
        if (current.type === 'findImageFromTags') {
          result.push({
            fromContext: true,
            imageLabelOrSha: current.imageLabelOrSha,
            stageId: current.refId,
          });
        }
        current.requisiteStageRefIds.forEach(function(id) {
          let next = all.find(stage => stage.refId === id);
          if (next) {
            result = result.concat(findUpstreamImages(next, all, visited));
          }
        });

        return result;
      }

      function findTriggerImages(triggers) {
        let result = triggers
          .filter(trigger => {
            return trigger.type === 'docker';
          })
          .map(trigger => {
            return {
              fromTrigger: true,
              repository: trigger.repository,
              account: trigger.account,
              organization: trigger.organization,
              registry: trigger.registry,
              tag: trigger.tag,
            };
          });

        return result;
      }

      function buildNewServerGroupCommand(application, defaults) {
        defaults = defaults || {};
        var credentialsLoader = AccountService.getCredentialsKeyedByAccount('ecs');

        var defaultCredentials = defaults.account || application.defaultCredentials.ecs;
        var defaultRegion = defaults.region || application.defaultRegions.ecs;

        var preferredZonesLoader = AccountService.getAvailabilityZonesForAccountAndRegion(
          'ecs',
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

            var defaultIamRole = 'None (No IAM role)';
            defaultIamRole = defaultIamRole.replace('{{application}}', application.name);

            var defaultImageCredentials = 'None (No registry credentials)';

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
              launchType: 'EC2',
              healthCheckType: 'EC2',
              selectedProvider: 'ecs',
              iamRole: defaultIamRole,
              dockerImageCredentialsSecret: defaultImageCredentials,
              availabilityZones: availabilityZones,
              subnetType: '',
              securityGroups: [],
              healthCheckGracePeriodSeconds: '',
              placementConstraints: [],
              placementStrategyName: '',
              taskDefinitionArtifact: {},
              useTaskDefinitionArtifact: false,
              placementStrategySequence: [],
              serviceDiscoveryAssociations: [],
              ecsClusterName: '',
              targetGroup: '',
              copySourceScalingPoliciesAndActions: true,
              useSourceCapacity: true,
              viewState: {
                useAllImageSelection: false,
                useSimpleCapacity: true,
                usePreferredZones: true,
                mode: defaults.mode || 'create',
                disableStrategySelection: true,
                dirty: {},
              },
            };

            if (
              application.attributes &&
              application.attributes.platformHealthOnlyShowOverride &&
              application.attributes.platformHealthOnly
            ) {
              command.interestingHealthProviderNames = ['ecs'];
            }

            return command;
          });
      }

      function buildServerGroupCommandFromPipeline(application, originalCluster, current, pipeline) {
        var pipelineCluster = _.cloneDeep(originalCluster);
        var region = Object.keys(pipelineCluster.availabilityZones)[0];
        // var instanceTypeCategoryLoader = instanceTypeService.getCategoryForInstanceType('ecs', pipelineCluster.instanceType);
        var commandOptions = { account: pipelineCluster.account, region: region };
        var asyncLoader = $q.all({ command: buildNewServerGroupCommand(application, commandOptions) });

        return asyncLoader.then(function(asyncData) {
          var command = asyncData.command;
          var zones = pipelineCluster.availabilityZones[region];
          var usePreferredZones = zones.join(',') === command.availabilityZones.join(',');

          let contextImages = findUpstreamImages(current, pipeline.stages) || [];
          contextImages = contextImages.concat(findTriggerImages(pipeline.triggers));

          if (command.docker && command.docker.image) {
            command.docker.image = reconcileUpstreamImages(command.docker.image, contextImages);
          }

          var viewState = {
            instanceProfile: asyncData.instanceProfile,
            disableImageSelection: true,
            useSimpleCapacity:
              pipelineCluster.capacity.min === pipelineCluster.capacity.max &&
              pipelineCluster.useSourceCapacity !== true,
            usePreferredZones: usePreferredZones,
            mode: 'editPipeline',
            submitButtonLabel: 'Done',
            templatingEnabled: true,
            existingPipelineCluster: true,
            dirty: {},
            contextImages: contextImages,
            pipeline: pipeline,
            currentStage: current,
          };

          var viewOverrides = {
            region: region,
            credentials: pipelineCluster.account,
            availabilityZones: pipelineCluster.availabilityZones[region],
            viewState: viewState,
          };

          pipelineCluster.strategy = pipelineCluster.strategy || '';

          return angular.extend({}, command, pipelineCluster, viewOverrides);
        });
      }

      // Only used to prepare view requiring template selecting
      function buildNewServerGroupCommandForPipeline(current, pipeline) {
        let contextImages = findUpstreamImages(current, pipeline.stages) || [];
        contextImages = contextImages.concat(findTriggerImages(pipeline.triggers));

        return $q.when({
          viewState: {
            requiresTemplateSelection: true,
            // applies viewState overrides after template selection
            overrides: {
              viewState: {
                mode: 'editPipeline',
                contextImages: contextImages,
                pipeline: pipeline,
                currentStage: current,
              },
            },
          },
        });
      }

      function buildUpdateServerGroupCommand(serverGroup) {
        var command = {
          type: 'modifyAsg',
          asgs: [{ asgName: serverGroup.name, region: serverGroup.region }],
          healthCheckType: serverGroup.asg.healthCheckType,
          credentials: serverGroup.account,
        };
        ecsServerGroupConfigurationService.configureUpdateCommand(command);
        return command;
      }

      function buildServerGroupCommandFromExisting(application, serverGroup, mode = 'clone') {
        var commandOptions = { account: serverGroup.account, region: serverGroup.region };
        var asyncLoader = $q.all({ command: buildNewServerGroupCommand(application, commandOptions) });

        // do NOT copy: deployment strategy. DO copy: account, region, cluster name, stack
        // TODO: query for & pull in ECS-specific data that would be useful, e.g, network mode, launch type
        return asyncLoader.then(function(asyncData) {
          var command = asyncData.command;

          command.credentials = serverGroup.account;
          command.app = serverGroup.moniker.app;
          command.stack = serverGroup.moniker.stack;
          command.region = serverGroup.region;
          command.ecsClusterName = serverGroup.ecsCluster;
          command.capacity = serverGroup.capacity;
          command.viewState.mode = mode;

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
