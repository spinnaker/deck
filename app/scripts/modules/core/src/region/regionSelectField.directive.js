'use strict';

const angular = require('angular');
import { react2angular } from 'react2angular';

import { RegionSelectField } from './RegionSelectField';

module.exports = angular
  .module('spinnaker.core.region.regionSelectField.directive', [])
  .component(
    'reactRegionSelectField',
    react2angular(RegionSelectField, [
      'regions',
      'component',
      'field',
      'account',
      'provider',
      'onChange',
      'labelColumns',
      'fieldColumns',
      'readOnly',
    ]),
  )
  .component('regionSelectFieldProxy', {
    controllerAs: 'vm',
    template: `
      <react-region-select-field regions="vm.regions"
                                 component="vm.component"
                                 field="vm.field"
                                 account="vm.account"
                                 provider="vm.provider"
                                 on-change="vm.propagate"
                                 label-columns="vm.labelColumns"
                                 field-columns="vm.fieldColumns"
                                 read-only="vm.readOnly"></react-region-select-field>
    `,
    bindings: {
      regions: '=',
      component: '=',
      field: '<',
      account: '=',
      provider: '=',
      onChange: '&',
      labelColumns: '<',
      fieldColumns: '<',
      readOnly: '=',
    },
    controller: function() {
      var vm = this;
      vm.propagate = function(data) {
        vm.component[vm.field] = data;
        vm.onChange();
      };
    },
  })
  .directive('regionSelectField', function() {
    return {
      restrict: 'E',
      template: `
        <region-select-field-proxy regions="regions"
                                   component="component"
                                   field="field"
                                   account="account"
                                   provider="provider"
                                   on-change="onChange()"
                                   label-columns="labelColumns"
                                   field-columns="fieldColumns"
                                   read-only="readOnly"></region-select-field-proxy>
      `,
      scope: {
        regions: '=',
        component: '=',
        field: '@',
        account: '=',
        provider: '=',
        onChange: '&',
        labelColumns: '@',
        fieldColumns: '@',
        readOnly: '=',
      },
    };
  });
