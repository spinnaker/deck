'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.core.notification.types.githubstatus', [])
  .config(function(notificationTypeConfigProvider) {
    notificationTypeConfigProvider.registerNotificationType({
      label: 'Github Status',
      key: 'githubStatus',
    });
  });
