'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.dcos.search.formatter', [])
  .factory('dcosSearchResultFormatter', function($q) {
    return {
      instances: function(entry) {
        //FIXME Copy pasted from Kubernetes, needs to be put into terms of DCOS
        return $q.when((entry.name || entry.instanceId) + ' (' + entry.namespace + ')');
      },
      serverGroups: function(entry) {
        //FIXME Copy pasted from Kubernetes, needs to be put into terms of DCOS
        return $q.when((entry.name || entry.serverGroup) + ' (' + (entry.namespace || entry.region) + ')');
      },
      loadBalancers: function(entry) {
        //FIXME Copy pasted from Kubernetes, needs to be put into terms of DCOS
        return $q.when(entry.name + ' (' + (entry.namespace || entry.region) + ')');
      },
    };
  });
