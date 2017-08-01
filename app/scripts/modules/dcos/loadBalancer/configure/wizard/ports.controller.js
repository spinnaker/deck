'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.loadBalancer.configure.dcos.ports', [])
  .controller('dcosLoadBalancerPortsController', function() {

    this.protocols = ['tcp', 'udp'];
    this.minPort = 10000;
    this.maxPort = 65535;
  });
