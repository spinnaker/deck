'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.loadBalancer.configure.dcos.resources', [])
  .controller('dcosLoadBalancerResourcesController', function() {
    this.minCpus = 0.01;
  });
