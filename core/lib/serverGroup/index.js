'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.core.serverGroup', [
    require('./serverGroup.write.service.js'),
    require('./serverGroup.transformer.js'),
    require('./configure/common/index.js'),
    require('./pod/index.js'),

  ]);
