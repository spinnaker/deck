'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.preconditions', [
  require('./preconditionTypeConfig.provider.js'),
  require('./selector'),
  require('./preconditionList.directive.js'),
  require('./preconditionType.service.js'),
  require('./modal'),
  require('./types'),
  require('../../../confirmationModal'),
  require('./precondition.details.filter.js')
]);
