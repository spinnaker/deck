'use strict';

let angular = require('angular');

import {TIME_FILTERS} from 'core/utils/filters';

module.exports = angular.module('spinnaker.core.deploymentStrategy.custom', [
  require('./customStrategySelector.directive.js'),
  require('./customStrategySelector.controller.js'),
  TIME_FILTERS,
  require('core/config/settings.js'),
])
  .config(function(deploymentStrategyConfigProvider, settings) {
    if (settings.feature && settings.feature.pipelines !== false) {
      deploymentStrategyConfigProvider.registerStrategy({
        label: 'Custom',
        description: 'Runs a custom deployment strategy',
        key: 'custom',
        providers: ['aws', 'gce', 'titus', 'kubernetes', 'appengine'],
        additionalFields: [],
        additionalFieldsTemplateUrl: require('./additionalFields.html'),
        initializationMethod: angular.noop,
      });
    }

  });
