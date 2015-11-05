const angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.preconditions.modal.types', [
  require('./clusterSize'),
  require('./expression'),
]);
