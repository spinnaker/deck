const angular = require('angular');

module.exports = angular.module('spinnaker.core.utils.waypoints', [
  require('./waypoint.directive.js'),
  require('./waypoint.service.js'),
  require('./waypointContainer.directive.js'),
]);
