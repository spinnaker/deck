'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.notifications', [
  require('./types'),
  require('./notificationTypeConfig.provider.js'),
  require('./selector'),
  require('./notificationList.directive.js'),
  require('./notificationType.service.js'),
  require('./modal'),
  require('../confirmationModal'),
  require('./notification.service.js'),
  require('./notification.details.filter.js')
]);
