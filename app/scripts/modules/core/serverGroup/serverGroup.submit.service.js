'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.serverGroup.submit.service', [
    require('./serverGroup.write.service.js'),
  ])
  .factory('serverGroupSubmitter', function (taskExecutor, serverGroupWriter) {
    function destroyServerGroup(serverGroup, application) {
      return (params) => serverGroupWriter.destroyServerGroup(serverGroup, application, params);
    }

    function disableServerGroup(serverGroup, application) {
      return (params) => serverGroupWriter.disableServerGroup(serverGroup, application, params);
    }

    function enableServerGroup(serverGroup, application) {
      return (params) => serverGroupWriter.enableServerGroup(serverGroup, application, params);
    }

    return {
      destroyServerGroup: destroyServerGroup,
      disableServerGroup: disableServerGroup,
      enableServerGroup: enableServerGroup,
    };
  });
