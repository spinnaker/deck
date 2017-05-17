'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.core.pipeline.config.preconditions', [
  require('./preconditionTypeConfig.provider.js'),
  require('./selector/preconditionSelector.directive.js'),
  require('./preconditionList.directive.js'),
  require('./preconditionType.service.js'),
  require('./modal/editPrecondition.controller.modal.js'),
  require('./precondition.details.filter.js')
]);
