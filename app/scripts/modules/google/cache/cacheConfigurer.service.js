'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.gce.cache.initializer', [
])
  .factory('gceCacheConfigurer', function (accountService, instanceTypeService, loadBalancerReader) {

    let config = Object.create(null);

    config.credentials = {
      initializers: [ () => accountService.getRegionsKeyedByAccount('gce') ],
    };

    config.instanceTypes = {
      initializers: [ () => instanceTypeService.getAllTypesByRegion('gce') ],
    };

    config.loadBalancers = {
      initializers: [ () => loadBalancerReader.listLoadBalancers('gce') ],
    };

    return config;
  })
  .name;
