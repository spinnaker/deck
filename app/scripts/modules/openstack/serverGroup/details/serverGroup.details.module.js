'use strict';

const angular = require('angular');

module.exports = angular.module('spinnaker.openstack.serverGroup.details', [
  require('./serverGroupDetails.openstack.controller.js'),
  require('./resize/resizeServerGroup.controller.js'),
  require('./rollback/rollbackServerGroup.controller.js')
]);
