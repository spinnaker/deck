'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.titan.serverGroup.transformer', [
    require('../../core/utils/lodash.js'),
  ])
  .factory('titanServerGroupTransformer', function ($q, _) {

    function normalizeServerGroup(serverGroup) {
      return $q.when(serverGroup); // no-op
    }

    function convertServerGroupCommandToDeployConfiguration(base) {
      // use _.defaults to avoid copying the backingData, which is huge and expensive to copy over
      var command = _.defaults({backingData: [], viewState: []}, base);
      if (base.viewState.mode !== 'clone') {
        delete command.source;
      }
      command.account = command.credentials;
      if (command.resources.ports) {
        var ports = '' + command.resources.ports;
        command.resources.ports = ports.split(/\s*,\s*/);
      }
      if (command.securityGroups) {
        var securityGroups = '' + command.securityGroups;
        command.securityGroups = securityGroups.split(/\s*,\s*/);
      }
      if (command.resources.allocateIpAddress === true) {
        delete command.resources.ports;
      }
      delete command.viewState;
      delete command.backingData;
      delete command.selectedProvider;
      return command;
    }

    return {
      convertServerGroupCommandToDeployConfiguration: convertServerGroupCommandToDeployConfiguration,
      normalizeServerGroup: normalizeServerGroup,
    };

  });
