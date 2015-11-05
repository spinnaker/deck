const angular = require('angular');

module.exports = angular.module('spinnaker.core.loadBalancer.filter', [
  require('./loadBalancer.filter.model.js'),
  require('./loadBalancer.filter.service.js'),
  require('./LoadBalancerFilterCtrl.js'),
]);
