'use strict';

const angular = require('angular');

import _ from 'lodash';

export const ORACLE_SERVERGROUP_SERVERGROUP_TRANSFORMER = 'spinnaker.oracle.serverGroup.transformer';
export const name = ORACLE_SERVERGROUP_SERVERGROUP_TRANSFORMER; // for backwards compatibility
angular.module(ORACLE_SERVERGROUP_SERVERGROUP_TRANSFORMER, []).factory('oracleServerGroupTransformer', [
  '$q',
  function($q) {
    let PROVIDER = 'oracle';

    function normalizeServerGroup(serverGroup) {
      return $q.when(serverGroup);
    }

    function convertServerGroupCommandToDeployConfiguration(base) {
      let command = _.defaults({ backingData: [], viewState: [] }, base);
      command.cloudProvider = PROVIDER;
      return command;
    }

    return {
      convertServerGroupCommandToDeployConfiguration,
      normalizeServerGroup,
    };
  },
]);
