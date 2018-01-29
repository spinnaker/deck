'use strict';

const angular = require('angular');

import { GLOBAL_SEARCH } from './globalSearch.component';

import './globalSearch.less';

module.exports = angular.module('spinnaker.core.search.global', [
  GLOBAL_SEARCH,
]);
