'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.loadBalancer.transformer', [
  require('../cloudProvider/serviceDelegate.service.js'),
])
  .factory('loadBalancerTransformer', function ( settings, _, serviceDelegate) {

    function normalizeLoadBalancer(loadBalancer) {
      return serviceDelegate.getDelegate(loadBalancer.provider || loadBalancer.type, 'loadBalancer.transformer').
        normalizeLoadBalancer(loadBalancer);
    }

    function normalizeLoadBalancerSet(loadBalancers) {
      let delegateIdentifier = loadBalancers[0].provider || loadBalancers[0].type;
      if (serviceDelegate.hasDelegate(delegateIdentifier, 'loadBalancer.setTransformer')) {
        return serviceDelegate.getDelegate(delegateIdentifier, 'loadBalancer.setTransformer')
          .normalizeLoadBalancerSet(loadBalancers);
      } else {
        return loadBalancers;
      }
    }

    return {
      normalizeLoadBalancer: normalizeLoadBalancer,
      normalizeLoadBalancerSet: normalizeLoadBalancerSet,
    };

  });
