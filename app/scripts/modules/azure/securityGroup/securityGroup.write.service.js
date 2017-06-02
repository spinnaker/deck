'use strict';

const angular = require('angular');
import _ from 'lodash';

import { INFRASTRUCTURE_CACHE_SERVICE, TASK_EXECUTOR } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.azure.securityGroup.write.service', [
    require('@uirouter/angularjs').default,
    TASK_EXECUTOR,
    INFRASTRUCTURE_CACHE_SERVICE
  ])
  .factory('azureSecurityGroupWriter', function (infrastructureCaches, taskExecutor) {


    function upsertSecurityGroup(securityGroup, application, descriptor, params = {}) {

      // We want to extend params with all attributes from securityGroup, but only if they don't already exist.
      _.assignWith(params, securityGroup, function (value, other) {
        return _.isUndefined(value) ? other : value;
      });

      var operation = taskExecutor.executeTask({
        job: [params],
        application: application,
        description: descriptor + ' Security Group: ' + name
      });

      infrastructureCaches.clearCache('securityGroup');

      return operation;
    }

    function deleteSecurityGroup(securityGroup, application, params = {}) {
      params.type = 'deleteSecurityGroup';
      params.securityGroupName = securityGroup.name;
      params.regions = [securityGroup.region];
      params.credentials = securityGroup.accountId;
      //params.cloudProvider = securityGroup.providerType;
      params.appName = application.name;

      var operation = taskExecutor.executeTask({
        job: [params],
        application: application,
        description: 'Delete Security Group: ' + securityGroup.name
      });

      infrastructureCaches.clearCache('securityGroup');

      return operation;
    }

    return {
      deleteSecurityGroup: deleteSecurityGroup,
      upsertSecurityGroup: upsertSecurityGroup
    };

  });
