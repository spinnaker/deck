'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.core.account', [
  require('./account.service.js'),
  require('./accountLabelColor.directive.js'),
  require('./accountSelectField.directive.js'),
  require('./accountTag.directive.js'),
  require('./collapsibleAccountTag.directive.js'),
  require('./providerToggles.directive.js'),
]);
