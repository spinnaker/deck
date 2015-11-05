'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.netflix.templateOverride.templateOverrides', [
  ])
  .config(function(templateOverrideRegistryProvider) {
    templateOverrideRegistryProvider.override('applicationNavHeader', require('./applicationNav.html'));
    templateOverrideRegistryProvider.override('pipelineConfigActions', require('./pipelineConfigActions.html'));
    templateOverrideRegistryProvider.override('spinnakerHeader', require('./spinnakerHeader.html'));
  }).name;
