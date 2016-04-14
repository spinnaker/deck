'use strict';

let angular = require('angular');

module.exports = angular
  .module('spinnaker.netfilx.fastProperty.pod.component', [
    require('angular-ui-router'),
  ])
  .component('fastPropertyPod', {
    templateUrl: require('./fastPropertyPod.html'),
    bindings: {
      key: '=',
      values: '='
    },
    controller: function($state) {
      let vm = this;

      vm.$state = $state;

      vm.showPropertyDetails = (propertyId) => {
        if($state.current.name.indexOf('.properties.propertyDetails') !== -1 ) {
          $state.go('^.propertyDetails', {propertyId: propertyId}, {inherit: true});
        } else {
          $state.go('.propertyDetails', {propertyId: propertyId}, {inherit: true});
        }

      };
    },
    controllerAs: 'fpPod'
  });
