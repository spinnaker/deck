import { IController, IComponentOptions, module } from 'angular';

import { get } from 'lodash';
import { Subject } from 'rxjs';

import { IServerGroup } from '@spinnaker/core';

import { IConfigurableMetric } from 'tencent/serverGroup';
import { TencentProviderSettings } from 'tencent/tencent.settings';
import { NAMESPACES } from './namespaces';

export interface IMetricOption {
  label: string;
  name: string;
}

export interface IMetricEditorState {
  advancedMode: boolean;
  metricsLoaded: boolean;
  metrics: IMetricOption[];
  selectedMetric: IMetricOption;
  noDefaultMetrics?: boolean;
}

export class MetricSelectorController implements IController {
  public alarmUpdated: Subject<void>;
  public namespaceUpdated = new Subject();

  public alarm: IConfigurableMetric;
  public namespaces = get(TencentProviderSettings, 'metrics.customNamespaces', []).concat(NAMESPACES);
  public state: IMetricEditorState;
  public serverGroup: IServerGroup;
  private metricNames = [
    'CPU_UTILIZATION',
    'MEM_UTILIZATION',
    'LAN_TRAFFIC_OUT',
    'LAN_TRAFFIC_IN',
    'WAN_TRAFFIC_OUT',
    'WAN_TRAFFIC_IN',
  ];
  public $onInit(): void {
    this.state = {
      advancedMode: false,
      metricsLoaded: false,
      metrics: [],
      selectedMetric: null,
    };
    this.updateAvailableMetrics();
    this.alarmUpdated.next();
  }

  public simpleMode(): void {
    this.alarm.dimensions = [{ name: 'AutoScalingGroupName', value: this.serverGroup.name }];
    this.state.advancedMode = false;
    this.updateAvailableMetrics();
  }

  public updateAvailableMetrics(): void {
    const { alarm } = this;
    Promise.resolve(
      this.metricNames.map(mn => ({
        cloudProvider: 'tencent',
        name: mn,
      })),
    ).then(results => {
      results = results || [];
      this.state.metricsLoaded = true;
      this.state.metrics = results.map(r => ({ label: r.name, name: r.name }));
      const selected = this.state.metrics.find(metric => metric.name === alarm.metricName);
      if (selected) {
        this.state.selectedMetric = selected;
      }
      this.metricChanged();
    });
  }
  public metricChanged(forceUpdateStatistics = false): void {
    const { alarm } = this;

    if (!this.state.metricsLoaded) {
      return;
    }
    if (this.state.selectedMetric) {
      const selected = this.state.selectedMetric;
      const alarmUpdated = alarm.metricName !== selected.name;
      alarm.metricName = selected.name;
      if (alarmUpdated || forceUpdateStatistics) {
        this.alarmUpdated.next();
      }
    } else {
      alarm.namespace = null;
      alarm.metricName = null;
      this.alarmUpdated.next();
    }
  }
}

const component: IComponentOptions = {
  bindings: {
    alarm: '<',
    serverGroup: '<',
    alarmUpdated: '<',
  },
  controller: MetricSelectorController,
  template: `
      <div class="text-center" style="display: inline-block; width: 100px; margin-top: 7px" ng-if="!$ctrl.state.metricsLoaded">
        <loading-spinner size="'small'"></loading-spinner>
      </div>
      <div style="display: inline-block; width: 500px" ng-if="$ctrl.state.metricsLoaded">
        <select class="form-control input-sm"
                required
                ng-model="$ctrl.state.selectedMetric"
                ng-change="$ctrl.metricChanged()"
                ng-if="!$ctrl.state.advancedMode"
                ng-options="metric as metric.label for metric in $ctrl.state.metrics">
        </select>
        <span class="input-label" style="margin-left: 5px"
              ng-if="$ctrl.state.advancedMode && $ctrl.state.metrics.length === 0">
          <strong>Note:</strong> no metrics found for selected namespace + dimensions
        </span>
        <div style="padding-left: 5px;">
          <a href class="small"
             ng-if="$ctrl.state.advancedMode && !$ctrl.state.noDefaultMetrics"
             ng-click="$ctrl.simpleMode()">
            Only show metrics for this auto scaling group <help-field key="tencent.scalingPolicy.search.restricted"></help-field>
          </a>
        </div>
      </div>`,
};

export const METRIC_SELECTOR_COMPONENT = 'spinnaker.tencent.scalingPolicy.alarm.metric.editor';
module(METRIC_SELECTOR_COMPONENT, []).component('tencentMetricSelector', component);
