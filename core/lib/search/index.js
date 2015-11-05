'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.search', [
  require('../cache'),
  require('./searchRank.filter.js'),
  require('./searchResult'),
  require('./infrastructure'),
  require('./global'),
  require('./search.service.js'),
]);
