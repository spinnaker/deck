'use strict';

const angular = require('angular');

module.exports = angular
  .module('spinnaker.deck.gce.loadBalancer.hostAndPathRulesButton.component', [
    require('angular-ui-bootstrap'),
    require('./hostAndPathRules.controller.js')
  ])
  .component('gceHostAndPathRulesButton', {
    bindings: {
      hostRules: '=',
      defaultService: '=',
      loadBalancerName: '='
    },
    template: '<a href ng-click="$ctrl.viewHostAndPathRules()">View Host and Path Rules</a>',
    controller: function($uibModal) {
      this.viewHostAndPathRules = () => {
        $uibModal.open({
          templateUrl: require('./hostAndPathRules.modal.html'),
          controller: 'gceHostAndPathRulesCtrl',
          controllerAs: 'ctrl',
          size: 'lg',
          resolve: {
            hostRules: () => this.hostRules,
            defaultService: () => this.defaultService,
            loadBalancerName: () => this.loadBalancerName,
          }
        });
      };
    }
  });
