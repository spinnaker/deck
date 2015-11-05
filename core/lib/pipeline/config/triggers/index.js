'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.trigger', [
    require('./trigger.directive.js'),
    require('./triggers.directive.js'),
    require('./jenkins'),
    require('./pipeline'),
    require('./cron'),
  ]);
