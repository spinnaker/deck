'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.serverGroup.configure.common', [
  require('./serverGroupConfiguration.service.js'),
  require('./basicSettingsMixin.controller.js'),
  require('./costFactor.js'),
  require('./instanceArchetypeSelector.js'),
  require('./instanceTypeSelector.js'),
  require('./runningExecutions.service.js'),
  require('./serverGroupCommandBuilder.js'),
  require('./serverGroupConfiguration.service.js'),
]);
