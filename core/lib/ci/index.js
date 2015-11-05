const angular = require('angular');

module.exports = angular.module('spinnaker.core.ci', [
  require('./jenkins'),
]);
