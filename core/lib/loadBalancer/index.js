'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.loadBalancer', [
    require('./filter'),
    require('./loadBalancer'),
    require('./AllLoadBalancersCtrl.js'),
    require('./loadBalancer.directive.js'),
    require('./loadBalancer.read.service.js'),
    require('./loadBalancer.transformer.js'),
    require('./loadBalancer.write.service.js'),
    require('./loadBalancerServerGroup.directive.js'),
    require('./LoadBalancersNavCtrl.js'),
    require('./loadBalancersTag.directive.js'),
  ]);
