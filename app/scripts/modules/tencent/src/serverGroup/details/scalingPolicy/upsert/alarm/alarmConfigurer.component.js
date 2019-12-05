'use strict';

const angular = require('angular');

import { Subject } from 'rxjs';

import { METRIC_SELECTOR_COMPONENT } from './metricSelector.component';

module.exports = angular
  .module('spinnaker.tencent.serverGroup.details.scalingPolicy.alarm.configurer', [
    require('./dimensionsEditor.component').name,
    METRIC_SELECTOR_COMPONENT,
  ])
  .component('tencentAlarmConfigurer', {
    bindings: {
      command: '=',
      modalViewState: '=',
      serverGroup: '<',
      boundsChanged: '&',
    },
    templateUrl: require('./alarmConfigurer.component.html'),
    controller: function() {
      this.statistics = ['AVERAGE', 'MAXIMUM', 'MINIMUM'];
      this.state = {
        units: null,
      };

      this.comparators = [
        { label: '>=', value: 'GREATER_THAN_OR_EQUAL_TO' },
        { label: '>', value: 'GREATER_THAN' },
        { label: '<=', value: 'LESS_THAN_OR_EQUAL_TO' },
        { label: '<', value: 'LESS_THAN' },
      ];

      this.periods = [
        { label: '1 minute', value: 60 },
        { label: '5 minutes', value: 60 * 5 },
        { label: '15 minutes', value: 60 * 15 },
        { label: '1 hour', value: 60 * 60 },
        { label: '4 hours', value: 60 * 60 * 4 },
        { label: '1 day', value: 60 * 60 * 24 },
      ];

      this.alarmUpdated = new Subject();

      this.thresholdChanged = () => {
        let source =
          this.modalViewState.comparatorBound === 'max' ? 'metricIntervalLowerBound' : 'metricIntervalUpperBound';
        if (this.command.step) {
          // always set the first step at the alarm threshold
          this.command.step.stepAdjustments[0][source] = this.command.alarm.threshold;
        }
        this.boundsChanged();
        this.alarmUpdated.next();
      };

      this.updateChart = () => this.alarmUpdated.next();

      this.alarmComparatorChanged = () => {
        let previousComparatorBound = this.modalViewState.comparatorBound;
        this.modalViewState.comparatorBound =
          this.command.alarm.comparisonOperator.indexOf('GREATER') === 0 ? 'max' : 'min';
        if (
          previousComparatorBound &&
          this.modalViewState.comparatorBound !== previousComparatorBound &&
          this.command.step
        ) {
          this.command.step.stepAdjustments = [{ adjustmentValue: 1 }];
          this.thresholdChanged();
        }
        this.alarmUpdated.next();
      };

      this.$onInit = () => {
        this.alarm = this.command.alarm;
        this.alarmComparatorChanged();
      };
    },
  });
