'use strict';

let angular = require('angular');

require('./details.less');
require('./main.less');
require('./navPopover.less');

module.exports = angular.module('spinnaker.core.presentation', [
  require('./anyFieldFilter'),
  require('./autoScroll'),
  require('./collapsibleSection'),
  require('./gist'),
  require('./isVisible'),
  require('./robotToHumanFilter'),
  require('./sortToggle'),
]);
