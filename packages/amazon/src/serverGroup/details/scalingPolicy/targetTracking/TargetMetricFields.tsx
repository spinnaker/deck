import { set } from 'lodash';
import * as React from 'react';

import { NumberInput, ReactSelectInput } from '@spinnaker/core';

import { ITargetTrackingPolicyCommand } from '../ScalingPolicyWriter';
import { ICustomizedMetricSpecification } from '../../../../domain';

export interface ITargetMetricFieldsProps {
  allowDualMode?: boolean;
  cloudwatch?: boolean;
  command: ITargetTrackingPolicyCommand;
  isCustomMetric: boolean;
  toggleMetricType?: () => void;
  unit: string;
  updateCommand: (command: ITargetTrackingPolicyCommand) => void;
}

export const TargetMetricFields = ({
  allowDualMode,
  cloudwatch,
  command,
  isCustomMetric,
  toggleMetricType,
  unit,
  updateCommand,
}: ITargetMetricFieldsProps) => {
  const predefinedMetrics = ['ASGAverageCPUUtilization', 'ASGAverageNetworkOut', 'ASGAverageNetworkIn'];
  const statistics = ['Average', 'Maximum', 'Minimum', 'SampleCount', 'Sum'];
  const [commandView, setCommandView] = React.useState<ITargetTrackingPolicyCommand>(command);

  const setCommandField = (path: string, value: any) => {
    const newCommand = { ...command };
    set(newCommand, path, value);
    setCommandView(newCommand);
    updateCommand(newCommand);
  };

  const updateAlarm = (newAlarm: ICustomizedMetricSpecification) => {
    setCommandField('targetTrackingConfiguration.customizedMetricSpecification', newAlarm);
  };
  // TODO: Check toggle function, create react2angular compnonent, test
  return (
    <div>
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
      <div className="row">
        <div className="col-md-2 sm-label-right">Metric</div>
        <div className="col-md-10 content-fields">
          {!isCustomMetric && (
            <ReactSelectInput
              value={commandView.targetTrackingConfiguration.predefinedMetricSpecification.predefinedMetricType}
              stringOptions={predefinedMetrics}
              onChange={(e) =>
                setCommandField(
                  'targetTrackingConfiguration.predefinedMetricSpecification.predefinedMetricType',
                  e.target.value,
                )
              }
            />
          )}
          {isCustomMetric && <div>ADD METRIC SELECTOR</div>}
          {allowDualMode && (
            <a className="clickable" onClick={toggleMetricType}>
              {isCustomMetric ? 'Use a predefined metrc' : 'Select a custom metric'}
            </a>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-md-2 sm-label-right">Target</div>
        <div className="col-md-10 content-fields">
          {isCustomMetric && (
            <div>
              <ReactSelectInput
                value={commandView.targetTrackingConfiguration.customizedMetricSpecification?.statistic}
                stringOptions={statistics}
                onChange={(e) =>
                  setCommandField('targetTrackingConfiguration.customizedMetricSpecification.statistic', e.target.value)
                }
                inputClassName="form-control input-sm"
              />
              <span className="sp-margin-xs-xaxis">of</span>
            </div>
          )}
          <div>
            <NumberInput
              value={command.targetTrackingConfiguration.targetValue}
              onChange={(e) =>
                setCommandField('targetTrackingConfiguration.targetValue', Number.parseInt(e.target.value))
              }
              inputClassName="form-control input-sm sp-margin-xs-right"
            />
            <span>{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
