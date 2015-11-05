'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.aws', [
  require('./wizard/deployInitializer.controller.js'),
  require('./wizard/ServerGroupBasicSettings.controller.js'),
  require('./wizard/ServerGroupLoadBalancers.controller.js'),
  require('./wizard/ServerGroupCapacity.controller.js'),
  require('./wizard/ServerGroupInstanceArchetype.controller.js'),
  require('./wizard/ServerGroupInstanceType.controller.js'),
  require('./wizard/ServerGroupSecurityGroups.controller.js'),
  require('./wizard/ServerGroupAdvancedSettings.controller.js'),
  require('./serverGroupBasicSettingsSelector.directive.js'),
  require('./serverGroupLoadBalancersSelector.directive.js'),
  require('./serverGroupSecurityGroupsSelector.directive.js'),
  require('./serverGroupCapacitySelector.directive.js'),
  require('../serverGroup.transformer.js'),
  require('./serverGroupAdvancedSettingsSelector.directive.js'),
]).name;
