'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.loadBalancer.read.service', [
    require('../naming/naming.service.js'),
    require('../cache/infrastructureCaches.js'),
    require('./loadBalancer.transformer.js'),
  ])
  .factory('loadBalancerReader', function ($q, Restangular, namingService,
                                           loadBalancerTransformer, infrastructureCaches) {

    function loadLoadBalancers(applicationName) {
      var loadBalancers = Restangular.one('applications', applicationName).all('loadBalancers').getList();
        return loadBalancers.then(function(results) {
//TODO(jcwest): remove this before opening pull request. For development only.
if(applicationName == 'app1') {
  results.push( {
      type: 'openstack',
			region: 'region1',
			account: 'test',
			name: 'test-s-d',
			protocol: 'HTTP',
			method : 'ROUND_ROBIN',
			subnetId: '4f848451-7283-481a-88b7-a9f55e925fd8',
			externalPort: 80,
			internalPort: 8100,
			floatingIpId: '8cfb7dd3-6767-4d07-a00f-f0ac9ce0922c',
			healthMonitor: {
				type: 'PING',
				delay: 10,
				timeout: 200,
				maxRetries: 2
			}
  } );
}
          results.forEach(addStackToLoadBalancer);
          return $q.all(results.map(loadBalancerTransformer.normalizeLoadBalancer));
        });
    }

    function addStackToLoadBalancer(loadBalancer) {
      var nameParts = namingService.parseLoadBalancerName(loadBalancer.name);
      loadBalancer.stack = nameParts.stack;
      loadBalancer.detail = nameParts.freeFormDetails;
    }

    function getLoadBalancerDetails(provider, account, region, name) {
//HACK! (jcwest) - For development only
if( account == 'test' && name == 'test-s-d' ) {
  return $q(function (resolve) { resolve( {
    type: 'openstack',
    region: 'region1',
    account: 'test',
    name: 'test-s-d',
    protocol: 'HTTP',
    method : 'ROUND_ROBIN',
    subnetId: '4f848451-7283-481a-88b7-a9f55e925fd8',
    externalPort: 80,
    internalPort: 8100,
    floatingIpId: '8cfb7dd3-6767-4d07-a00f-f0ac9ce0922c',
    healthMonitor: {
      type: 'PING',
      delay: 10,
      timeout: 200,
      maxRetries: 2
    },
    serverGroups: [{name: 'sg1'}]
  } ); } );
}
      return Restangular.one('loadBalancers').one(account).one(region).one(name).get({'provider': provider});
    }

    function listLoadBalancers(provider) {
      return Restangular
        .all('loadBalancers')
        .withHttpConfig({cache: infrastructureCaches.loadBalancers})
        .getList({provider: provider});
    }

    return {
      loadLoadBalancers: loadLoadBalancers,
      getLoadBalancerDetails: getLoadBalancerDetails,
      listLoadBalancers: listLoadBalancers,
    };

  });
