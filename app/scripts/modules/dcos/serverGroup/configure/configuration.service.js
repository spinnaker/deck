'use strict';

import _ from 'lodash';

import { ACCOUNT_SERVICE } from '@spinnaker/core';

const angular = require('angular');

module.exports = angular.module('spinnaker.dcos.serverGroup.configure.configuration.service', [
  ACCOUNT_SERVICE,
  require('../../image/image.reader.js'),
])
  .factory('dcosServerGroupConfigurationService', function($q, accountService, dcosImageReader) {
    function configureCommand(application, command, query = '') {
      let queries = command.docker.image ? [grabImageAndTag(command.docker.image.imageId)] : [];

      if (query) {
        queries.push(query);
      }

      let imagesPromise;
      if (queries.length) {
        imagesPromise = $q.all(queries
          .map(q => dcosImageReader.findImages({
            provider: 'dockerRegistry',
            count: 50,
            q: q })))
          .then(_.flatten);
      } else {
        imagesPromise = $q.when([]);
      }

      return $q.all({
        credentialsKeyedByAccount: accountService.getCredentialsKeyedByAccount('dcos'),
        allImages: imagesPromise
      }).then(function(backingData) {
        backingData.accounts = _.keys(backingData.credentialsKeyedByAccount);
        backingData.filtered = {};
        backingData.allSecrets = {};

        if (application.attributes && application.attributes.secrets) {
          backingData.allSecrets = JSON.parse(application.attributes.secrets);
        }

        if (command.viewState.contextImages) {
          backingData.allImages = backingData.allImages.concat(command.viewState.contextImages);
        }

        command.backingData = backingData;

        return $q.all().then(function() {
          configureAccount(command);
          attachEventHandlers(command);
        });
      });
    }

    function grabImageAndTag(imageId) {
      return imageId.split('/').pop();
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

    function configureDockerRegistries(command) {
      var result = { dirty: {} };

      var selectedDcosCluster = _.find(command.backingData.filtered.dcosClusters, {name: command.dcosCluster});
      if (selectedDcosCluster) {
        command.backingData.filtered.dockerRegistries = selectedDcosCluster.dockerRegistries;
      } else {
        command.backingData.filtered.dockerRegistries = [];
      }

      return result;
    }

    function configureImages(command) {
      var result = { dirty: {} };

      var registryAccountNames = _.map(command.backingData.filtered.dockerRegistries, function(registry) {
        return registry.accountName;
      });
      command.backingData.filtered.images = _.map(_.filter(command.backingData.allImages, function(image) {
        return image.fromContext || image.fromTrigger || _.includes(registryAccountNames, image.account) || image.message;
      }), function(image) {
        return mapImage(image);
      });

      if (command.docker.image && !_.some(command.backingData.filtered.images, {imageId: command.docker.image.imageId})) {
        result.dirty.imageId = command.docker.image.imageId;
        command.docker.image = null;
      }

      return result;
    }

    function mapImage(image) {
      if (image.message !== undefined) {
        return image;
      }

      return {
        repository: image.repository,
        tag: image.tag,
        imageId: buildImageId(image),
        registry: image.registry,
        fromContext: image.fromContext,
        fromTrigger: image.fromTrigger,
        cluster: image.cluster,
        account: image.account,
        pattern: image.pattern,
        stageId: image.stageId,
      };
    }

    function configureSecrets(command) {
      var result = { dirty: {} };

      if (!command.region || !command.backingData.allSecrets[command.dcosCluster]) {
        command.backingData.filtered.secrets = [];
      } else {
        var appPath = command.account + '/' + command.region + '/';

        command.backingData.filtered.secrets = _.filter(command.backingData.allSecrets[command.dcosCluster].sort(), function (secret) {
          var secretPath = secret.substring(0, secret.lastIndexOf('/') + 1);
          return appPath.startsWith(secretPath);
        });
      }

      if (command.viewModel.env) {
        command.viewModel.env.forEach(function(envModel) {
          if (envModel.isSecret && envModel.rawValue != null && !command.backingData.filtered.secrets.includes(envModel.rawValue)) {
            result.dirty.secrets = result.dirty.secrets || [];
            result.dirty.secrets.push(envModel.rawValue);
            envModel.rawValue = null;
            envModel.value = null;
          }
        });
      }

      return result;
    }

    function configureDcosClusters(command) {
      var result = { dirty: {} };

      command.backingData.filtered.dcosClusters = command.backingData.account.dcosClusters;

      if (!_.chain(command.backingData.filtered.dcosClusters).some({name: command.dcosCluster}).value()) {
        result.dirty.dcosCluster = command.dcosCluster;
        command.dcosCluster = null;
      }

      angular.extend(result.dirty, configureDockerRegistries(command).dirty);
      angular.extend(result.dirty, configureImages(command).dirty);
      angular.extend(result.dirty, configureSecrets(command).dirty);

      return result;
    }

    function configureAccount(command) {
      var result = { dirty: {} };

      command.backingData.account = command.backingData.credentialsKeyedByAccount[command.account];

      if (command.backingData.account) {
        angular.extend(result.dirty, configureDcosClusters(command).dirty);
      }

      return result;
    }

    function updateRegion(command) {
      command.region = command.dcosCluster + (command.group ? ((command.group.substring(0,1) == '/' ? '' : '/') + command.group) : '');
    }

    function attachEventHandlers(command) {
      command.accountChanged = function accountChanged() {
        var result = { dirty: {} };
        angular.extend(result.dirty, configureAccount(command).dirty);
        command.viewState.dirty = command.viewState.dirty || {};
        angular.extend(command.viewState.dirty, result.dirty);
        return result;
      };

      command.dcosClusterChanged = function dcosClusterChanged() {
        updateRegion(command);

        var result = { dirty: {} };
        angular.extend(result.dirty, configureDockerRegistries(command).dirty);
        angular.extend(result.dirty, configureSecrets(command).dirty);
        command.viewState.dirty = command.viewState.dirty || {};
        angular.extend(command.viewState.dirty, result.dirty);
        return result;
      };

      command.groupChanged = function groupChanged() {
        updateRegion(command);

        var result = { dirty: {} };
        angular.extend(result.dirty, configureSecrets(command).dirty);
        command.viewState.dirty = command.viewState.dirty || {};
        angular.extend(command.viewState.dirty, result.dirty);
        return result;
      };
    }

    return {
      configureCommand: configureCommand,
      configureAccount: configureAccount,
      configureImages: configureImages,
      configureDockerRegistries: configureDockerRegistries,
      configureSecrets: configureSecrets,
      buildImageId: buildImageId
    };
  });
