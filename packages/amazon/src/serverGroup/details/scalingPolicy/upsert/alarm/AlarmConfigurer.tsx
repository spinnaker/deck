import * as React from 'react';

import { ICloudMetricStatistics, NumberInput, ReactSelectInput } from '@spinnaker/core';

import { MetricAlarmChart } from '../../chart/MetricAlarmChart';
import { IAmazonServerGroup, IScalingPolicyAlarm, IStepAdjustment } from '../../../../../domain';

export interface IAlarmConfigurerProps {
  alarm: IScalingPolicyAlarm;
  multipleAlarms: boolean;
  serverGroup: IAmazonServerGroup;
  stepAdjustments: IStepAdjustment[];
  stepsChanged: (steps: IStepAdjustment[]) => void;
  updateAlarm: (alarm: IScalingPolicyAlarm) => void;
}

const STATISTICS = ['Average', 'Maximum', 'Minimum', 'SampleCount', 'Sum'];

const COMPARATORS = [
  { label: '>=', value: 'GreaterThanOrEqualToThreshold' },
  { label: '>', value: 'GreaterThanThreshold' },
  { label: '<=', value: 'LessThanOrEqualToThreshold' },
  { label: '<', value: 'LessThanThreshold' },
];

const PERIODS = [
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 60 * 5 },
  { label: '15 minutes', value: 60 * 15 },
  { label: '1 hour', value: 60 * 60 },
  { label: '4 hours', value: 60 * 60 * 4 },
  { label: '1 day', value: 60 * 60 * 24 },
];

export const AlarmConfigurer = ({
  alarm,
  multipleAlarms,
  serverGroup,
  stepAdjustments,
  stepsChanged,
  updateAlarm,
}: IAlarmConfigurerProps) => {
  const [unit, setUnit] = React.useState<string>(alarm.unit);
  const comparatorBound = alarm.comparisonOperator?.indexOf('Greater') === 0 ? 'max' : 'min';

  React.useEffect(() => {
    if (stepAdjustments) {
      const source = comparatorBound === 'max' ? 'metricIntervalLowerBound' : 'metricIntervalUpperBound';
      const newStep: IStepAdjustment = {
        scalingAdjustment: 1,
        [source]: alarm.threshold,
      };
      stepsChanged([newStep]);
    }
  }, [comparatorBound]);

  const onChartLoaded = (stats: ICloudMetricStatistics) => setUnit(stats.unit);

  // TODO: If needed, dual-updates with useState for rendering speeds on the inputs
  const onAlarmChange = (key: string, value: any) => {
    const newAlarm = {
      ...alarm,
      [key]: value,
    };
    updateAlarm(newAlarm);
  };

  return (
    <div>
      {multipleAlarms && (
        <div className="row">
          <div className="col-md-12">
            <div className="alert alert-warning">
              <p>
                <i className="fa fa-exclamation-triangle"></i> This scaling policy is configured with multiple alarms.
                You are only editing the first alarm.
              </p>
              <p>To edit or remove the additional alarms, you will need to use the AWS console.</p>
            </div>
          </div>
        </div>
      )}
      {alarm.alarmActionArns?.length > 1 && (
        <div className="row">
          <div className="col-md-12">
            <div className="alert alert-warning">
              <p>
                <i className="fa fa-exclamation-triangle"></i> This alarm is used in multiple scaling policies. Any
                changes here will affect those other scaling policies.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-md-2 sm-label-right">Whenever</div>
        <div className="col-md-10 content-fields">
          <ReactSelectInput
            value={alarm.statistic}
            onChange={(e) => onAlarmChange('statistic', e.target.value)}
            stringOptions={STATISTICS}
            inputClassName="sp-margin-xs-right"
          />
          <span className="input-label"> of </span>
          <span>ADD METRIC SELECTOR HERE WHEN IT HAS MERGED</span>
        </div>
      </div>
      <div className="row">
        <div className="col-md-2 sm-label-right">is</div>
        <div className="col-md-10 content-fields">
          <ReactSelectInput
            value={alarm.comparisonOperator}
            onChange={(e) => onAlarmChange('comparisonOperator', e.target.value)}
            options={COMPARATORS}
            inputClassName="sp-margin-xs-right"
          />
          <NumberInput
            value={alarm.threshold}
            onChange={(e) => onAlarmChange('threshold', Number.parseInt(e.target.value))}
            inputClassName="sp-margin-xs-right"
          />
          <span className="input-label">{unit}</span>
        </div>
      </div>
      <div className="row">
        <div className="col-md-2 sm-label-right">for at least</div>
        <div className="col-md-10 content-fields">
          <NumberInput
            value={alarm.evaluationPeriods}
            onChange={(e) => onAlarmChange('evaluationPeriods', Number.parseInt(e.target.value))}
          />
          <span className="input-label"> consecutive period(s) of </span>
          <ReactSelectInput
            value={alarm.period}
            onChange={(e) => onAlarmChange('period', e.target.value)}
            options={PERIODS}
            inputClassName="sp-margin-xs-right"
          />
        </div>
      </div>
      <div className="row" ng-if="$ctrl.alarm.metricName">
        <div className="col-md-10 col-md-offset-1">
          {alarm && (
            <div>
              <MetricAlarmChart alarm={alarm} serverGroup={serverGroup} onChartLoaded={onChartLoaded} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
