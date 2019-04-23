import { IComponentController, IComponentOptions, module } from 'angular';
import { Subject } from 'rxjs';
import { Dictionary } from 'lodash';

import { IServerGroup } from '@spinnaker/core';

import { IScalingPolicyAlarm, ITargetTrackingConfiguration } from 'tencent/domain';
import { ITargetTrackingState } from './upsertTargetTracking.controller';

const predefinedMetricTypeMapping: Dictionary<string> = {
  ASGAverageCPUUtilization: 'CPUUtilization',
  ASGAverageNetworkIn: 'NetworkIn',
  ASGAverageNetworkOut: 'NetworkOut',
};

class TargetTrackingChartController implements IComponentController {
  public config: ITargetTrackingConfiguration;
  public serverGroup: IServerGroup;
  public state: ITargetTrackingState;
  public alarmUpdated: Subject<void>;
  public alarm: IScalingPolicyAlarm;

  public $onInit() {
    this.alarmUpdated = this.alarmUpdated || new Subject<void>();
    this.alarm = this.buildChartAlarm();
    this.synchronizeAlarm();
    this.alarmUpdated.subscribe(() => this.synchronizeAlarm());
  }

  public $onDestroy() {
    this.alarmUpdated.unsubscribe();
  }

  private synchronizeAlarm(): void {
    const { config, alarm, serverGroup } = this;
    if (config.customizedMetricSpecification) {
      alarm.namespace = config.customizedMetricSpecification.namespace;
      alarm.metricName = config.customizedMetricSpecification.metricName;
      alarm.dimensions = config.customizedMetricSpecification.dimensions;
      alarm.statistic = config.customizedMetricSpecification.statistic;
    } else {
      alarm.metricName = predefinedMetricTypeMapping[config.predefinedMetricSpecification.predefinedMetricType];
      alarm.namespace = 'AWS/EC2';
      alarm.dimensions = [{ name: 'AutoScalingGroupName', value: serverGroup.name }];
    }
    alarm.threshold = config.targetValue;
  }

  private buildChartAlarm(): IScalingPolicyAlarm {
    return {
      alarmName: null,
      alarmArn: null,
      metricName: null,
      namespace: null,
      statistic: 'AVERAGE',
      dimensions: [],
      period: 60,
      threshold: this.config.targetValue,
      comparisonOperator: 'GREATER_THAN',
      okactions: [],
      insufficientDataActions: [],
      alarmActions: [],
      continuousTime: null,
      alarmDescription: null,
      unit: null,
    };
  }
}

const component: IComponentOptions = {
  bindings: {
    config: '<',
    serverGroup: '<',
    state: '=',
    alarmUpdated: '<',
  },
  controller: TargetTrackingChartController,
  template: `
    <tencent-metric-alarm-chart alarm="$ctrl.alarm"
                        style="height: 150px;"
                        alarm-updated="$ctrl.alarmUpdated"
                        ticks="{x: 12, y: 5}"
                        margins="{top: 10, left: 50}"
                        stats="$ctrl.state"
                        server-group="$ctrl.serverGroup"></tencent-metric-alarm-chart>
  `,
};

export const TARGET_TRACKING_CHART_COMPONENT = 'spinnaker.tencent.scalingPolicy.targetTracking.chart.component';
module(TARGET_TRACKING_CHART_COMPONENT, []).component('targetTrackingChart', component);
