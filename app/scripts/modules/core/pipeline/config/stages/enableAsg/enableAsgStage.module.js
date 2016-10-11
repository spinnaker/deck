'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.enableAsg', [
  require('./enableAsgStage.js'),
  require('../stage.module.js'),
  require('../core/stage.core.module.js'),
  require('core/account/account.module.js'),
]);
