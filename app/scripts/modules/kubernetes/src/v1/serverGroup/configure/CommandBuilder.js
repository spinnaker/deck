import { KUBERNETES_V1_CLUSTER_CLUSTER_KUBERNETES_MODULE } from '../../cluster/cluster.kubernetes.module';
('use strict');

const angular = require('angular');

export const KUBERNETES_V1_SERVERGROUP_CONFIGURE_COMMANDBUILDER =
  'spinnaker.kubernetes.serverGroupCommandBuilder.service';
export const name = KUBERNETES_V1_SERVERGROUP_CONFIGURE_COMMANDBUILDER; // for backwards compatibility
angular
  .module(KUBERNETES_V1_SERVERGROUP_CONFIGURE_COMMANDBUILDER, [KUBERNETES_V1_CLUSTER_CLUSTER_KUBERNETES_MODULE])
  .factory('kubernetesServerGroupCommandBuilder', [
    '$q',
    'kubernetesClusterCommandBuilder',
    function($q, kubernetesClusterCommandBuilder) {
      function buildNewServerGroupCommand(application, defaults) {
        if (defaults == null) {
          defaults = {};
        }
        var command = kubernetesClusterCommandBuilder.buildNewClusterCommand(application, defaults);
        command.targetSize = 1;

        return $q.when(command);
      }

      function buildNewServerGroupCommandForPipeline(current, pipeline) {
        return $q.when(kubernetesClusterCommandBuilder.buildNewClusterCommandForPipeline(current, pipeline));
      }

      function buildServerGroupCommandFromPipeline(app, command, current, pipeline) {
        return $q.when(
          kubernetesClusterCommandBuilder.buildClusterCommandFromPipeline(app, command, current, pipeline),
        );
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
    },
  ]);
