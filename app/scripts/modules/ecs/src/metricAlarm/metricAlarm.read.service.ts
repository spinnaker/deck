import { module } from 'angular';

import { API } from '@spinnaker/core';
import { IMetricAlarmDescriptor } from './MetricAlarm';

export class MetricAlarmReader {
  public listMetricAlarms(): PromiseLike<IMetricAlarmDescriptor[]> {
    return API.all('ecs').all('cloudMetrics').all('alarms').getList();
  }
}

export const METRIC_ALARM_READ_SERVICE = 'spinnaker.ecs.metricAlarm.read.service';

module(METRIC_ALARM_READ_SERVICE, []).service('metricAlarmReader', MetricAlarmReader);
