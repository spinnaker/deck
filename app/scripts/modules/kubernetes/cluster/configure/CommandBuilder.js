'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular.module('spinnaker.kubernetes.clusterCommandBuilder.service', [
  require('core/config/settings.js'),
  require('core/account/account.service.js'),
])
  .factory('kubernetesClusterCommandBuilder', function (settings, accountService) {
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
      var defaultAccount = defaults.account || settings.providers.kubernetes.defaults.account;

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
        viewState: {
          mode: defaults.mode || 'create',
          disableStrategySelection: true,
        },
        useAutoscaler: false,
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
      };

      applyHealthProviders(application, command);

      attemptToSetValidAccount(application, defaultAccount, command);

      return command;
    }

    function buildClusterCommandFromExisting(application, existing, mode) {
      mode = mode || 'clone';

      var command = existing.deployDescription;

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
      if (image.fromContext) {
        return `${image.cluster} ${image.pattern}`;
      } else if (image.fromTrigger && !image.tag) {
        return `${image.registry}/${image.repository} (Tag resolved at runtime)`;
      } else {
        return `${image.registry}/${image.repository}:${image.tag}`;
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

    function findUpstreamImages(current, all, visited = {}) {
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
          cluster: current.cluster,
          pattern: current.imageNamePattern,
          repository: current.name,
          stageId: current.refId
        });
      }
      current.requisiteStageRefIds.forEach(function(id) {
        let next = all.find((stage) => stage.refId === id);
        if (next) {
          result = result.concat(findUpstreamImages(next, all, visited));
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
      let contextImages = findUpstreamImages(current, pipeline.stages) || [];
      contextImages = contextImages.concat(findTriggerImages(pipeline.triggers));
      return {
        strategy: '',
        viewState: {
          contextImages: contextImages,
          mode: 'editPipeline',
          submitButtonLabel: 'Done',
          requiresTemplateSelection: true,
        }
      };
    }

    function buildClusterCommandFromPipeline(app, originalCommand, current, pipeline) {
      let command = _.cloneDeep(originalCommand);
      let contextImages = findUpstreamImages(current, pipeline.stages) || [];
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
