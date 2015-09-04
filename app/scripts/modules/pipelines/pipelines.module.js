'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.pipelines', [
  require('exports?"restangular"!imports?_=lodash!restangular'),
  require('exports?"ui.sortable"!angular-ui-sortable'),
  require('utils:lodash'),
  require('./config/pipelineConfig.module.js'),
  require('../caches/viewStateCache.js'),
  require('../authentication/authentication.module.js'),
  require('../notifications/notifications.module.js'),
  require('../caches/deckCacheFactory.js'),
]).name;
