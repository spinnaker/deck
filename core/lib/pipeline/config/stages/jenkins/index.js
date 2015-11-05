'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.stage.jenkins', [
  require('./jenkinsStage.js'),
  require('../../../../cache'),
  require('utils'),
  require('../../../../ci'),
  require('./jenkinsExecutionDetails.controller.js'),
]);
