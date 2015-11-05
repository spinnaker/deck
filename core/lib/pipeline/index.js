'use strict';

let angular = require('angular');

require('./pipelines.less');

module.exports = angular.module('spinnaker.core.pipeline', [
  require('exports?"restangular"!imports?_=lodash!restangular'),
  require('exports?"ui.sortable"!angular-ui-sortable'),
  require('utils'),
  require('./config'),
  require('../cache'),
  require('../authentication'),
  require('../notification'),
  require('../cache'),
]);
