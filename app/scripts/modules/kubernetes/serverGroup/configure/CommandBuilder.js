'use strict';

const angular = require('angular');

import { ACCOUNT_SERVICE, NAMING_SERVICE } from '@spinnaker/core';

module.exports = angular.module('spinnaker.kubernetes.serverGroupCommandBuilder.service', [
  ACCOUNT_SERVICE,
  NAMING_SERVICE,
  require('../../cluster/cluster.kubernetes.module.js'),
])
  .factory('kubernetesServerGroupCommandBuilder', function ($q, accountService, namingService,
                                                            kubernetesClusterCommandBuilder) {
    function buildNewServerGroupCommand(application, defaults = {}) {
      var command = kubernetesClusterCommandBuilder.buildNewClusterCommand(application, defaults);
      command.targetSize = 1;

      return $q.when(command);
    }

    function buildNewServerGroupCommandForPipeline(current, pipeline) {
      return $q.when(kubernetesClusterCommandBuilder.buildNewClusterCommandForPipeline(current, pipeline));
    }

    function buildServerGroupCommandFromPipeline(app, command, current, pipeline) {
      return $q.when(kubernetesClusterCommandBuilder.buildClusterCommandFromPipeline(app, command, current, pipeline));
    }

    function buildServerGroupCommandFromExisting(application, serverGroup, mode) {
      var command = kubernetesClusterCommandBuilder.buildClusterCommandFromExisting(application, serverGroup, mode);

      command.source = {
        serverGroupName: serverGroup.name,
        asgName: serverGroup.name,
        account: serverGroup.account,
        region: serverGroup.region,
        namespace: serverGroup.region,
      };

      return $q.when(command);
    }

    return {
      buildNewServerGroupCommand: buildNewServerGroupCommand,
      buildServerGroupCommandFromExisting: buildServerGroupCommandFromExisting,
      buildNewServerGroupCommandForPipeline: buildNewServerGroupCommandForPipeline,
      buildServerGroupCommandFromPipeline: buildServerGroupCommandFromPipeline,
    };
  });
