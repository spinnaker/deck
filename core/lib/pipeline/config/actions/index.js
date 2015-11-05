'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.actions', [
  require('./delete/index.js'),
  require('./json/index.js'),
  require('./rename/index.js'),
  require('./enableParallel/index.js'),
  require('./disableParallel/index.js'),
]);
