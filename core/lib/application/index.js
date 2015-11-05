'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.application', [
    require('./listExtractor'),
    require('./application.controller.js'),
    require('./applications.controller.js'),
    require('./applicationConfig.controller.js'),
    // TODO: the modal directory should probably be refactored to be more modular
    require('./modal/createApplication.modal.controller.js'),
    require('./modal/editApplication.controller.modal.js'),
    require('./modal/platformHealthOverride.directive.js'),
    // TODO: the service directory should probably be refactored to be more modular
    require('./service/applications.read.service.js'),
    require('./service/applications.write.service.js'),
  ]);
