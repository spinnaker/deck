'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.bake', [
  require('./bakery.service.js'),
  require('./bakeStage.js'),
  require('../core'),
  require('utils'),
  require('./aws'),
  require('./docker'),
  require('./gce'),
]);
