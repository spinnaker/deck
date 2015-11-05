'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.cf', [
  require('./wizard/deployInitializer.controller.js'),
  require('./wizard/ServerGroupBasicSettings.controller.js'),
  require('./serverGroupConfiguration.service.js'),
  require('./serverGroupBasicSettingsSelector.directive.js'),

])
.name;
