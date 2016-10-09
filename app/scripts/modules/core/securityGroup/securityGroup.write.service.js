'use strict';

import _ from 'lodash';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.securityGroup.write.service', [
    require('../cache/infrastructureCaches.js'),
    require('../task/taskExecutor.js')
  ])
  .factory('securityGroupWriter', function (taskExecutor, infrastructureCaches) {

    function upsertSecurityGroup(command, application, descriptor, params = {}) {
      params.type = 'upsertSecurityGroup';
      params.credentials = command.credentials || command.accountName;

      // We want to extend params with all attributes from command, but only if they don't already exist.
      _.assignWith(params, command, function(value, other) {
        return _.isUndefined(value) ? other : value;
      });

      var operation = taskExecutor.executeTask({
        job: [params],
        application: application,
        description: descriptor + ' Security Group: ' + command.name
      });

      infrastructureCaches.clearCache('securityGroups');

      return operation;
    }

    function deleteSecurityGroup(securityGroup, application, params = {}) {
      params.type = 'deleteSecurityGroup';
      params.securityGroupName = securityGroup.name;
      params.regions = [securityGroup.region];
      params.credentials = securityGroup.accountId;

      var operation = taskExecutor.executeTask({
        job: [params],
        application: application,
        description: 'Delete Security Group: ' + securityGroup.name
      });

      infrastructureCaches.clearCache('securityGroups');

      return operation;
    }


    return {
      upsertSecurityGroup: upsertSecurityGroup,
      deleteSecurityGroup: deleteSecurityGroup,
    };

  });
