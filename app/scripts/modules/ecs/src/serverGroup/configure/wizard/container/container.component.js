'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.ecs.serverGroup.configure.wizard.container.component', [])
  .component('ecsServerGroupContainer', {
    bindings: {
      command: '=',
      application: '=',
    },
    templateUrl: require('./container.component.html'),
  });
