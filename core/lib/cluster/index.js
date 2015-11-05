'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.cluster', [
    require('./allClusters.controller.js'),
    require('./clusterPod.directive.js'),
    require('./cluster.service.js'),
    require('./serverGroup.sequence.filter.js'),
    require('./filter'),
  ]);
