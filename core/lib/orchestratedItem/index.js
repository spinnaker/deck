const angular = require('angular');

module.exports = angular.module('orchestratedItem', [
  require('./orchestratedItem.transformer.js'),
  require('./timeBoundaries.service.js'),
]);
