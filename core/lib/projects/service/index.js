const angular = require('angular');

module.exports = angular.module('spinnaker.projects.service', [
  require('./project.read.service.js'),
  require('./project.write.service.js'),
]);
