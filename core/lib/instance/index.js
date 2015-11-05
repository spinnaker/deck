'use strict';

let angular = require('angular');

require('./instanceSelection.less');

module.exports = angular
  .module('spinnaker.core.instance', [
    require('./details'),
    require('./loadBalancer'),
    require('./list'),
    require('./read'),
    require('./write'),
    require('./instanceTypeService.js'),
    require('./instances.directive.js'),
  ]);
