'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.azure.AzureServerGroup.write.service', [
    require('../../core/task/taskExecutor.js'),
    require('./serverGroup.transformer.js'),
  ])
  .factory('azureServerGroupWriter', function (taskExecutor) {

    function destroyServerGroup(serverGroup, application, params = {}) {
      params.serverGroupName = serverGroup.name;
      params.asgName = serverGroup.name;
      params.type = 'destroyServerGroup';
      params.regions = [serverGroup.region];
      params.credentials = serverGroup.account;
      params.cloudProvider = serverGroup.type;

      return taskExecutor.executeTask({
        job: [params],
        application: application,
        description: 'Destroy Server Group: ' + serverGroup.name
      });
    }

    function disableServerGroup(serverGroup, applicationName, params = {}) {
      params.serverGroupName = serverGroup.name;
      params.asgName = serverGroup.name;
      params.type = 'disableServerGroup';
      params.regions = [serverGroup.region];
      params.region = serverGroup.region;
      params.credentials = serverGroup.account;
      params.cloudProvider = serverGroup.type;

      return taskExecutor.executeTask({
        job: [params],
        application: applicationName,
        description: 'Disable Server Group: ' + serverGroup.name
      });
    }

    function enableServerGroup(serverGroup, application, params = {}) {
      params.serverGroupName = serverGroup.name;
      params.asgName = serverGroup.name;
      params.type = 'enableServerGroup';
      params.regions = [serverGroup.region];
      params.region = serverGroup.region;
      params.credentials = serverGroup.account;
      params.cloudProvider = serverGroup.type;

      return taskExecutor.executeTask({
        job: [params],
        application: application,
        description: 'Enable Server Group: ' + serverGroup.name
      });
    }

    return {
      destroyServerGroup: destroyServerGroup,
      disableServerGroup: disableServerGroup,
      enableServerGroup: enableServerGroup
    };
  });
