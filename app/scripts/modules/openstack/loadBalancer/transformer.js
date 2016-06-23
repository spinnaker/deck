'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.openstack.loadBalancer.transformer', [
])
  .factory('openstackLoadBalancerTransformer', function (settings) {
    function normalizeLoadBalancer(loadBalancer) {
      loadBalancer.provider = loadBalancer.type;
      loadBalancer.instances = [];
      return loadBalancer;
    }

    function serverGroupIsInLoadBalancer(serverGroup, loadBalancer) {
      return serverGroup.type === 'openstack' &&
        serverGroup.account === loadBalancer.account &&
        serverGroup.namespace === loadBalancer.namespace &&
        serverGroup.loadBalancers.indexOf(loadBalancer.name) !== -1;
    }

    function constructNewLoadBalancerTemplate() {
      return {
        provider: 'openstack',
        account: settings.providers.openstack ? settings.providers.openstack.defaults.account : null,
        stack: '',
        detail: '',
        subnetId: '',
        floatingIpId: '',
//TODO: is namespace needed?
//        namespace: settings.providers.openstack ? settings.providers.openstack.defaults.namespace : null,
        protocol: 'HTTPS',
        externalPort: 443,
        internalPort: 443,
        method: 'ROUND_ROBIN',
        healthMonitor: {
          type: 'HTTPS',
          method: 'GET',
          url: '/healthCheck',
          expectedStatusCodes: [200],
          delay: 10,
          timeout: 200,
          maxRetries: 2
        }
      };
    }

    function convertLoadBalancerForEditing(loadBalancer) {
      return loadBalancer;
    }

    return {
      normalizeLoadBalancer: normalizeLoadBalancer,
      constructNewLoadBalancerTemplate: constructNewLoadBalancerTemplate,
      serverGroupIsInLoadBalancer: serverGroupIsInLoadBalancer,
      convertLoadBalancerForEditing: convertLoadBalancerForEditing
    };
  });
