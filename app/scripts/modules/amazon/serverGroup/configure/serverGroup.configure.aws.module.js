'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.serverGroup.configure.aws', [
  require('../../../account/account.module.js'),
  require('./wizard/deployInitializer.controller.js'),
  require('../../../caches/infrastructureCaches.js'),
  require('./wizard/ServerGroupBasicSettings.controller.js'),
  require('./wizard/ServerGroupLoadBalancers.controller.js'),
  require('./wizard/ServerGroupCapacity.controller.js'),
  require('./wizard/ServerGroupInstanceArchetype.controller.js'),
  require('./wizard/ServerGroupInstanceType.controller.js'),
  require('./wizard/ServerGroupSecurityGroups.controller.js'),
  require('./wizard/ServerGroupAdvancedSettings.controller.js'),
  require('../serverGroup.transformer.js'),
  require('../../../serverGroups/configure/common/instanceArchetypeSelector.js'),
  require('../../../serverGroups/configure/common/instanceTypeSelector.js')
]).name;
