'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.cf.cache.initializer', [
])
  .factory('cfCacheConfigurer', function ($q, accountService, instanceTypeService, loadBalancerReader) {

    let config = Object.create(null);

    config.credentials = {
      initializers: [ () => accountService.getRegionsKeyedByAccount('cf') ],
    };

    config.instanceTypes = {
      initializers: [ () => instanceTypeService.getAllTypesByRegion('cf') ],
    };

    config.loadBalancers = {
      initializers: [ () => loadBalancerReader.listLoadBalancers('cf') ],
    };

    return config;
  })
  .name;
