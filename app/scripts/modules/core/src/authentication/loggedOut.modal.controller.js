'use strict';

const angular = require('angular');

import './loggedOut.modal.less';

module.exports = angular
  .module('spinnaker.core.authentication.loggedOut.modal.controller', [])
  .controller('LoggedOutModalCtrl', function($window) {
    this.login = () => {
      $window.location.reload();
      return true;
    };
  });
