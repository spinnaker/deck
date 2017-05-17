'use strict';

const angular = require('angular');
import _ from 'lodash';

import { ACCOUNT_SERVICE } from '@spinnaker/core';

import { KubernetesProviderSettings } from '../../kubernetes.settings';

module.exports = angular.module('spinnaker.kubernetes.clusterCommandBuilder.service', [
  ACCOUNT_SERVICE
])
  .factory('kubernetesClusterCommandBuilder', function (accountService) {
    function attemptToSetValidAccount(application, defaultAccount, command) {
      return accountService.listAccounts('kubernetes').then(function(kubernetesAccounts) {
        var kubernetesAccountNames = _.map(kubernetesAccounts, 'name');
        var firstKubernetesAccount = null;

        if (application.accounts.length) {
          firstKubernetesAccount = _.find(application.accounts, function (applicationAccount) {
            return kubernetesAccountNames.includes(applicationAccount);
          });
        } else if (kubernetesAccountNames.length) {
          firstKubernetesAccount = kubernetesAccountNames[0];
        }

        var defaultAccountIsValid = defaultAccount && kubernetesAccountNames.includes(defaultAccount);

        command.account =
          defaultAccountIsValid ? defaultAccount : (firstKubernetesAccount ? firstKubernetesAccount : 'my-account-name');
      });
    }

    function applyHealthProviders(application, command) {
      command.interestingHealthProviderNames = ['KubernetesContainer', 'KubernetesPod'];
    }

    function buildNewClusterCommand(application, defaults = {}) {
      var defaultAccount = defaults.account || KubernetesProviderSettings.defaults.account;

      var command = {
        account: defaultAccount,
        application: application.name,
        strategy: '',
        targetSize: 1,
        cloudProvider: 'kubernetes',
        selectedProvider: 'kubernetes',
        namespace: 'default',
        containers: [],
        volumeSources: [],
        buildImageId: buildImageId,
        groupByRegistry: groupByRegistry,
        terminationGracePeriodSeconds: 30,
        viewState: {
          mode: defaults.mode || 'create',
          disableStrategySelection: true,
          useAutoscaler: false,
        },
        capacity: {
          min: 1,
          desired: 1,
          max: 1,
        },
        scalingPolicy: {
          cpuUtilization: {
            target: 40,
          },
        },
        deployment: {
          enabled: false,
          minReadySeconds: 0,
          deploymentStrategy: {
            type: 'RollingUpdate',
            rollingUpdate: {
              maxUnavailable: 1,
              maxSurge: 1
            }
          }
        }
      };

      applyHealthProviders(application, command);

      attemptToSetValidAccount(application, defaultAccount, command);

      return command;
    }

    function buildClusterCommandFromExisting(application, existing, mode) {
      mode = mode || 'clone';

      var command = _.cloneDeep(existing.deployDescription);

      command.groupByRegistry = groupByRegistry;
      command.cloudProvider = 'kubernetes';
      command.selectedProvider = 'kubernetes';
      command.account = existing.account;
      command.buildImageId = buildImageId;
      command.strategy = '';

      command.containers.forEach((container) => {
        container.imageDescription.imageId = buildImageId(container.imageDescription);
      });

      command.viewState = {
        mode: mode,
        useAutoscaler: !!command.scalingPolicy,
      };

      if (!command.capacity) {
        command.capacity = {
          min: command.targetSize,
          max: command.targetSize,
          desired: command.targetSize,
        };
      }

      if (!_.has(command, 'scalingPolicy.cpuUtilization.target')) {
        command.scalingPolicy = { cpuUtilization: { target: 40, }, };
      }

      applyHealthProviders(application, command);

      return command;
    }

    function groupByRegistry(container) {
      if (container.imageDescription) {
        if (container.imageDescription.fromContext) {
          return 'Find Image Result(s)';
        } else if (container.imageDescription.fromTrigger) {
          return 'Images from Trigger(s)';
        } else {
          return container.imageDescription.registry;
        }
      }
    }

    function buildImageId(image) {
      if (image.fromFindImage) {
        return `${image.cluster} ${image.pattern}`;
      } else if (image.fromBake) {
        return `${image.repository} (Baked during execution)`;
      } else if (image.fromTrigger && !image.tag) {
        return `${image.registry}/${image.repository} (Tag resolved at runtime)`;
      } else {
        if (image.registry) {
          return `${image.registry}/${image.repository}:${image.tag}`;
        } else {
          return `${image.repository}:${image.tag}`;
        }
      }
    }

    function reconcileUpstreamImages(containers, upstreamImages) {
      let result = [];
      containers.forEach((container) => {
        if (container.imageDescription.fromContext) {
          let matchingImage = upstreamImages.find((image) => container.imageDescription.stageId === image.stageId);
          if (matchingImage) {
            container.imageDescription.cluster = matchingImage.cluster;
            container.imageDescription.pattern = matchingImage.pattern;
            container.imageDescription.repository = matchingImage.repository;
            result.push(container);
          }
        } else if (container.imageDescription.fromTrigger) {
          let matchingImage = upstreamImages.find((image) => {
            return container.imageDescription.registry === image.registry
              && container.imageDescription.repository === image.repository
              && container.imageDescription.tag === image.tag;
          });
          if (matchingImage) {
            result.push(container);
          }
        } else {
          result.push(container);
        }
      });
      return result;
    }

    function findContextImages(current, all, visited = {}) {
      // This actually indicates a loop in the stage dependencies.
      if (visited[current.refId]) {
        return [];
      } else {
        visited[current.refId] = true;
      }
      let result = [];
      if (current.type === 'findImage') {
        result.push({
          fromContext: true,
          fromFindImage: true,
          cluster: current.cluster,
          pattern: current.imageNamePattern,
          repository: current.name,
          stageId: current.refId
        });
      } else if (current.type === 'bake') {
        result.push({
          fromContext: true,
          fromBake: true,
          repository: current.ami_name,
          organization: current.organization,
          stageId: current.refId
        });
      }
      current.requisiteStageRefIds.forEach(function(id) {
        let next = all.find((stage) => stage.refId === id);
        if (next) {
          result = result.concat(findContextImages(next, all, visited));
        }
      });

      return result;
    }

    function findTriggerImages(triggers) {
      return triggers.filter((trigger) => {
        return trigger.type === 'docker';
      }).map((trigger) => {
        return {
          fromTrigger: true,
          repository: trigger.repository,
          account: trigger.account,
          organization: trigger.organization,
          registry: trigger.registry,
          tag: trigger.tag,
        };
      });
    }

    function buildNewClusterCommandForPipeline(current, pipeline) {
      let contextImages = findContextImages(current, pipeline.stages) || [];
      contextImages = contextImages.concat(findTriggerImages(pipeline.triggers));
      return {
        strategy: '',
        viewState: {
          contextImages: contextImages,
          mode: 'editPipeline',
          submitButtonLabel: 'Done',
          requiresTemplateSelection: true,
          useAutoscaler: false,
        }
      };
    }

    function buildClusterCommandFromPipeline(app, originalCommand, current, pipeline) {
      let command = _.cloneDeep(originalCommand);
      let contextImages = findContextImages(current, pipeline.stages) || [];
      contextImages = contextImages.concat(findTriggerImages(pipeline.triggers));
      command.containers = reconcileUpstreamImages(command.containers, contextImages);
      command.containers.map((container) => {
        container.imageDescription.imageId = buildImageId(container.imageDescription);
      });
      command.groupByRegistry = groupByRegistry;
      command.buildImageId = buildImageId;
      command.strategy = command.strategy || '';
      command.selectedProvider = 'kubernetes';
      command.viewState = {
        mode: 'editPipeline',
        contextImages: contextImages,
        submitButtonLabel: 'Done',
        useAutoscaler: !!command.scalingPolicy,
      };

      if (!_.has(command, 'scalingPolicy.cpuUtilization.target')) {
        command.scalingPolicy = { cpuUtilization: { target: 40, }, };
      }

      return command;
    }

    return {
      buildNewClusterCommand: buildNewClusterCommand,
      buildClusterCommandFromExisting: buildClusterCommandFromExisting,
      buildNewClusterCommandForPipeline: buildNewClusterCommandForPipeline,
      buildClusterCommandFromPipeline: buildClusterCommandFromPipeline,
      groupByRegistry: groupByRegistry,
      buildImageId: buildImageId,
    };
  });
