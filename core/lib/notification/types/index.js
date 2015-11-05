const angular = require('angular');

module.exports = angular.module('spinnaker.core.notification.types', [
  require('./email'),
  require('./hipchat'),
  require('./sms'),
]);
