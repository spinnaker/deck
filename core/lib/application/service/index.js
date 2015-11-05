const angular = require('angular');

module.exports = angular.module('spinnaker.core.application.service', [
  require('./applications.read.service.js'),
  require('./applications.write.service.js'),
]);
