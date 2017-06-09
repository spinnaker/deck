'use strict';

const angular = require('angular');

import { INFRASTRUCTURE_CACHE_SERVICE, TASK_EXECUTOR } from '@spinnaker/core';

module.exports = angular.module('spinnaker.deck.gce.httpLoadBalancer.write.service', [
    TASK_EXECUTOR,
    INFRASTRUCTURE_CACHE_SERVICE
  ])
  .factory('gceHttpLoadBalancerWriter', function (taskExecutor, infrastructureCaches) {
    function upsertLoadBalancers (loadBalancers, application, descriptor) {
      loadBalancers.forEach((lb) => {
        angular.extend(lb, {
          type: 'upsertLoadBalancer',
          cloudProvider: 'gce',
          loadBalancerName: lb.name
        });
      });

      infrastructureCaches.clearCache('loadBalancers');
      infrastructureCaches.clearCache('backendServices');
      infrastructureCaches.clearCache('healthChecks');

      return taskExecutor.executeTask({
        job: loadBalancers,
        application: application,
        description: `${descriptor} Load Balancer: ${loadBalancers[0].urlMapName}`
      });
    }

    function deleteLoadBalancers (loadBalancer, application, params = {}) {
      let job = {
        type: 'deleteLoadBalancer',
        loadBalancerName: loadBalancer.listeners[0].name,
        regions: ['global'],
        region: 'global',
        loadBalancerType: 'HTTP',
        cloudProvider: loadBalancer.provider,
        credentials: loadBalancer.account,
      };

      angular.extend(job, params);

      infrastructureCaches.clearCache('loadBalancers');
      infrastructureCaches.clearCache('backendServices');
      infrastructureCaches.clearCache('healthChecks');

      return taskExecutor.executeTask({
        job: [job],
        application: application,
        description: `Delete load balancer: ${loadBalancer.urlMapName} in ${loadBalancer.account}:global`
      });
    }

    return { upsertLoadBalancers, deleteLoadBalancers };
  });
