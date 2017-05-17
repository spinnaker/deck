'use strict';

import _ from 'lodash';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.cf.serverGroup.transformer', [])
  .factory('cfServerGroupTransformer', function ($q) {

    function normalizeServerGroup(serverGroup) {
      return $q.when(serverGroup); // no-op
    }

    function convertServerGroupCommandToDeployConfiguration(base) {
      // use _.defaults to avoid copying the backingData, which is huge and expensive to copy over
      var command = _.defaults({backingData: [], viewState: []}, base);
      if (base.viewState.mode !== 'clone') {
        delete command.source;
      }
      command.availabilityZones = {};
      command.availabilityZones[command.region] = [base.zone];
      command.account = command.credentials;
      delete command.region;
      delete command.viewState;
      delete command.backingData;
      delete command.selectedProvider;
      delete command.providerType;

      return command;
    }

    return {
      convertServerGroupCommandToDeployConfiguration: convertServerGroupCommandToDeployConfiguration,
      normalizeServerGroup: normalizeServerGroup,
    };
  });
