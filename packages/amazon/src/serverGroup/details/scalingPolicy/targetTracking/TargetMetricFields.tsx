import { cloneDeep, set } from 'lodash';
import * as React from 'react';

import { NumberInput, ReactSelectInput } from '@spinnaker/core';

import { ITargetTrackingPolicyCommand } from '../ScalingPolicyWriter';
import { TargetTrackingChart } from './TargetTrackingChart';
import { IAmazonServerGroup, ICustomizedMetricSpecification, IScalingPolicyAlarmView } from '../../../../domain';
import { MetricSelector } from '../upsert/alarm/MetricSelector';

import './TargetMetricFields.less';

export type MetricType = 'custom' | 'predefined';
export interface ITargetMetricFieldsProps {
  allowDualMode?: boolean;
  cloudwatch?: boolean;
  command: ITargetTrackingPolicyCommand;
  isCustomMetric: boolean;
  serverGroup: IAmazonServerGroup;
  toggleMetricType?: (type: MetricType) => void;
  unit?: string;
  updateCommand: (command: ITargetTrackingPolicyCommand) => void;
}

export const TargetMetricFields = ({
  allowDualMode,
  cloudwatch,
  command,
  isCustomMetric,
  serverGroup,
  toggleMetricType,
  unit,
  updateCommand,
}: ITargetMetricFieldsProps) => {
  const predefinedMetrics = ['ASGAverageCPUUtilization', 'ASGAverageNetworkOut', 'ASGAverageNetworkIn'];
  const statistics = ['Average', 'Maximum', 'Minimum', 'SampleCount', 'Sum'];
  const [commandView, setCommandView] = React.useState<ITargetTrackingPolicyCommand>(command);
  const [isCustom, setIsCustom] = React.useState<boolean>(isCustomMetric);
  const [unitView, setUnitView] = React.useState<string>(unit);

  const setCommandField = (path: string, value: any) => {
    const newCommand = cloneDeep(commandView);
    set(newCommand, path, value);
    setCommandView(newCommand);
    updateCommand(newCommand);
  };

  const updateAlarm = (newAlarm: ICustomizedMetricSpecification) => {
    setCommandField('targetTrackingConfiguration.customizedMetricSpecification', newAlarm);
  };

  const onMetricTypeChange = () => {
    const newCommand = cloneDeep(commandView);
    if (isCustom) {
      set(newCommand, 'targetTrackingConfiguration.predefinedMetricSpecification', {
        predefinedMetricType: 'ASGAverageCPUUtilization',
      });
      set(newCommand, 'targetTrackingConfiguration.customizedMetricSpecification', null);
    } else {
      set(newCommand, 'targetTrackingConfiguration.predefinedMetricSpecification', null);
      set(newCommand, 'targetTrackingConfiguration.customizedMetricSpecification', {
        metricName: 'CPUUtilization',
        namespace: 'AWS/EC2',
        dimensions: [{ name: 'AutoScalingGroupName', value: serverGroup.name }],
        statistic: 'Average',
      });
    }

    setCommandView(newCommand);
    updateCommand(newCommand);
    setIsCustom(!isCustom);
    toggleMetricType(isCustom ? 'predefined' : 'custom');
  };

  return (
    <div className="TargetMetricFields sp-margin-l-xaxis">
      <p>
        With target tracking policies, Amazon will automatically adjust the size of your ASG to keep the selected metric
        as close as possible to the selected value.
      </p>
      {cloudwatch && (
        <p>
          <b>Note:</b> metrics must be sent to Amazon CloudWatch before they can be used in auto scaling. If you do not
          see a metric below, click "Configure available metrics" in the server group details to set up forwarding from
          Atlas to CloudWatch.
        </p>
      )}
      <div className="row sp-margin-s-yaxis">
        <div className="col-md-2 sm-label-right">Metric</div>
        <div className="col-md-10 content-fields">
          {!isCustom && (
            <ReactSelectInput
              value={commandView.targetTrackingConfiguration.predefinedMetricSpecification?.predefinedMetricType}
              stringOptions={predefinedMetrics}
              onChange={(e) =>
                setCommandField(
                  'targetTrackingConfiguration.predefinedMetricSpecification.predefinedMetricType',
                  e.target.value,
                )
              }
              inputClassName="metric-select-input"
            />
          )}
          {isCustom && (
            <MetricSelector
              alarm={commandView.targetTrackingConfiguration.customizedMetricSpecification as IScalingPolicyAlarmView}
              serverGroup={serverGroup}
              updateAlarm={updateAlarm}
            />
          )}
          {allowDualMode && (
            <a className="clickable" onClick={onMetricTypeChange}>
              {isCustom ? 'Use a predefined metric' : 'Select a custom metric'}
            </a>
          )}
        </div>
      </div>
      <div className="row sp-margin-s-yaxis">
        <div className="col-md-2 sm-label-right">Target</div>
        <div className="col-md-10 content-fields horizontal">
          {isCustom && (
            <div className="horizontal middle">
              <ReactSelectInput
                value={commandView.targetTrackingConfiguration.customizedMetricSpecification?.statistic}
                stringOptions={statistics}
                onChange={(e) =>
                  setCommandField('targetTrackingConfiguration.customizedMetricSpecification.statistic', e.target.value)
                }
                inputClassName="form-control input-sm target-input"
              />
              <span className="sp-margin-xs-xaxis">of</span>
            </div>
          )}
          <div className="horizontal middle">
            <NumberInput
              value={commandView.targetTrackingConfiguration.targetValue}
              onChange={(e) =>
                setCommandField('targetTrackingConfiguration.targetValue', Number.parseInt(e.target.value))
              }
              inputClassName="form-control input-sm sp-margin-xs-right"
            />
            <span>{unitView}</span>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-10 col-md-offset-1">
          <TargetTrackingChart
            config={commandView.targetTrackingConfiguration}
            serverGroup={serverGroup}
            unit={unitView}
            updateUnit={(u) => setUnitView(u)}
          />
        </div>
      </div>
    </div>
  );
};
