'use strict';

let angular = require('angular');

module.exports = angular.module('spinnaker.openstack.subnet.subnetSelectField.directive', [
  require('../../core/config/settings'),
  require('../../core/utils/lodash'),
  require('../../core/subnet/subnet.read.service.js'),
  require('../common/selectField.directive.js')
])
  .directive('osSubnetSelectField', function (settings, _, subnetReader) {
    return {
      restrict: 'E',
      templateUrl: require('./subnetSelectField.directive.html'),
      scope: {
        label: '@',
        labelColumnSize: '@',
        helpKey: '@',
        model: '=',
        filter: '=',
        onChange: '&',
        readOnly: '=',
        allowNoSelection: '=',
        noOptionsMessage: '@',
        noSelectionMessage: '@'
      },
      link: function(scope) {
        _.defaults(scope, {
          label: 'Subnet',
          labelColumnSize: 3,
          subnets: [],
          filter: {}
        });

//        _.defaults(scope.filter, {type: 'openstack'});

        function updateSubnetOptions() {
          subnetReader.listSubnets().then(function(subnets) {

            //TODO (jcwest): remove this override once subnet listing is working
            subnets = [
              {type: 'openstack', account: 'test', region: 'RegionOne', id: '4f848451-7283-481a-88b7-a9f55e925fd8', name: 'private-subnet'},
              {type: 'openstack', account: 'test', region: 'RegionOne', id: '21ff12db-3085-4e43-8764-a2173600f9a2', name: 'lb-mgmt-subnet'},
              {type: 'openstack', account: 'test', region: 'RegionOne', id: '85e35b80-a867-43ad-96e1-ac254b342dfe', name: 'ipv6-public-subnet'},
              {type: 'openstack', account: 'test', region: 'RegionOne', id: '68047e71-3830-490a-ba47-b926ffe3c466', name: 'ipv6-private-subnet'},
              {type: 'openstack', account: 'test', region: 'RegionOne', id: '0ea79028-6bf0-4347-ab03-2939e652216c', name: 'public-subnet'}
            ];

            scope.subnets = _(subnets)
              .filter(_.assign({type: 'openstack'}, scope.filter))
              .map(function(s) { return {label: s.name, value: s.id}; })
              .valueOf();
          });
        }

//        updateSubnetOptions();
        scope.$watch('filter', updateSubnetOptions);
        updateSubnetOptions();

      }
    };
});
