const angular = require('angular');

module.exports = angular.module('spinnaker.core.instance.loadBalancer', [
  require('./health'),

]);
