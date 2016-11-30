'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.kubernetes.serverGroup.submitter', [
    require('core/serverGroup/serverGroup.write.service.js'),
  ])
  .factory('kubernetesServerGroupSubmitter', function (serverGroupWriter) {

    function destroyServerGroup(serverGroup, application) {
      return (params) => serverGroupWriter.destroyServerGroup(serverGroup, application, angular.extend(params, {
        namespace: serverGroup.namespace,
        interestingHealthProviderNames: ['KubernetesService']
      }));
    }

    function enableServerGroup(serverGroup, application) {
      return (params) => serverGroupWriter.enableServerGroup(serverGroup, application, angular.extend(params, {
          namespace: serverGroup.region,
          interestingHealthProviderNames: ['KubernetesService']
      }));
    }

    function disableServerGroup(serverGroup, application) {
      return (params) => serverGroupWriter.disableServerGroup(serverGroup, application, angular.extend(params, {
          namespace: serverGroup.region,
          interestingHealthProviderNames: ['KubernetesService']
      }));
    }

    return {
      destroyServerGroup: destroyServerGroup,
      enableServerGroup: enableServerGroup,
      disableServerGroup: disableServerGroup,
    };
  });
