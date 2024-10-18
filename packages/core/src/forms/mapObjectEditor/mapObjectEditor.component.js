'use strict';

import * as angular from 'angular';
import { isString } from 'lodash';

import { CORE_VALIDATION_VALIDATEUNIQUE_DIRECTIVE } from '../../validation/validateUnique.directive';

import './mapObjectEditor.component.less';

export const CORE_FORMS_MAPOBJECTEDITOR_MAPOBJECTEDITOR_COMPONENT = 'spinnaker.core.forms.mapObjectEditor.component';
export const name = CORE_FORMS_MAPOBJECTEDITOR_MAPOBJECTEDITOR_COMPONENT; // for backwards compatibility
angular
  .module(CORE_FORMS_MAPOBJECTEDITOR_MAPOBJECTEDITOR_COMPONENT, [CORE_VALIDATION_VALIDATEUNIQUE_DIRECTIVE])
  .component('mapObjectEditor', {
    bindings: {
      model: '=',
      keyLabel: '@',
      valueLabel: '@',
      addButtonLabel: '@',
      allowEmpty: '=?',
      onChange: '&',
      labelsLeft: '<?',
      label: '@',
      hiddenKeys: '<',
    },
    controller: [
      '$scope',
      function ($scope) {
        this.backingModel = [];

        const modelKeys = () => Object.keys(this.model);

        this.addField = () => {
          this.backingModel.push({ key: '', value: '', checkUnique: modelKeys() });
          // do not fire the onChange event, since no values have been committed to the object
        };

        this.removeField = (index) => {
          this.backingModel.splice(index, 1);
          this.synchronize();
          this.onChange();
        };

        this.onValueChange = (index) => {
          const formattedValue = this.formattedValues[index];

          // Parse the JSON if it looks like an object or array, otherwise leave it as a string
          try {
            this.backingModel[index].value = JSON.parse(formattedValue);
          } catch (e) {
            this.backingModel[index].value = formattedValue; // Not JSON, so treat it as a string
          }

          // Sync changes with the model
          this.synchronize();
        };

        this.formatValueForDisplay = (value) => {
          return typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
        };

        // Clears existing values from model, then replaces them
        this.synchronize = () => {
          if (this.isParameterized) {
            return;
          }
          const modelStart = JSON.stringify(this.model);
          const allKeys = this.backingModel.map((pair) => pair.key);
          modelKeys().forEach((key) => delete this.model[key]);
          this.backingModel.forEach((pair) => {
            if (pair.key && (this.allowEmpty || pair.value)) {
              try {
                // Parse value if it is a valid JSON object
                this.model[pair.key] = JSON.parse(pair.value);
              } catch (e) {
                // If value is not a valid JSON object, just store the raw value
                this.model[pair.key] = pair.value;
              }
            }
            // include other keys to verify no duplicates
            pair.checkUnique = allKeys.filter((key) => pair.key !== key);
          });
          if (modelStart !== JSON.stringify(this.model)) {
            this.onChange();
          }
        };

        // In Angular 1.7 Directive bindings were removed in the constructor, default values now must be instantiated within $onInit
        // See https://docs.angularjs.org/guide/migration#-compile- and https://docs.angularjs.org/guide/migration#migrate1.5to1.6-ng-services-$compile
        this.$onInit = () => {
          // Set default values for optional fields
          this.onChange = this.onChange || angular.noop;
          this.keyLabel = this.keyLabel || 'Key';
          this.valueLabel = this.valueLabel || 'Value';
          this.addButtonLabel = this.addButtonLabel || 'Add Field';
          this.allowEmpty = this.allowEmpty || false;
          this.labelsLeft = this.labelsLeft || false;
          this.tableClass = this.label ? '' : 'no-border-top';
          this.columnCount = this.labelsLeft ? 5 : 3;
          this.model = this.model || {};
          this.isParameterized = isString(this.model);
          this.hiddenKeys = this.hiddenKeys || [];

          if (this.model && !this.isParameterized) {
            modelKeys().forEach((key) => {
              this.backingModel.push({ key: key, value: this.model[key] });
            });
          }

          this.formattedValues = this.backingModel.map((pair) => this.formatValueForDisplay(pair.value));
        };

        $scope.$watch(() => JSON.stringify(this.backingModel), this.synchronize);
      },
    ],
    templateUrl: require('./mapObjectEditor.component.html'),
  });
