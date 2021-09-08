import { module } from 'angular';
import { set } from 'lodash';
import * as React from 'react';
import { react2angular } from 'react2angular';

import { HelpField, NumberInput, withErrorBoundary } from '@spinnaker/core';

import { IUpsertScalingPolicyCommand } from '../ScalingPolicyWriter';

export interface IScalingPolicyAdditionalSettingsProps {
  command: IUpsertScalingPolicyCommand;
  isInstanceType: boolean;
  isNew: boolean;
  operator: string;
  updateCommand: (command: IUpsertScalingPolicyCommand) => void;
}

export const ScalingPolicyAdditionalSettings = ({
  command,
  isInstanceType,
  isNew,
  operator,
  updateCommand,
}: IScalingPolicyAdditionalSettingsProps) => {
  const [commandView, setCommandView] = React.useState<IUpsertScalingPolicyCommand>(command);
  const setCommandField = (path: string, value: number) => {
    const newCommand = { ...command };
    set(newCommand, path, value);
    setCommandView(newCommand);
    updateCommand(newCommand);
  };

  return (
    <div>
      <h4 className="section-heading">Additional Settings</h4>
      <div className="section-body section-additional-settings">
        {!isNew && (
          <div className="row">
            <div className="col-md-2 sm-label-right">Policy Name</div>
            <div className="col-md-10 content-fields">
              <span className="form-control-static select-placeholder">{commandView.name}</span>
            </div>
          </div>
        )}
        {!isInstanceType && (
          <div className="row">
            <div className="col-md-2 sm-label-right">Adjustment Step</div>
            <div className="col-md-10 content-fields">
              <span className="form-control-static select-placeholder">
                {`${operator} instannces in increments of at least `}
              </span>
              <NumberInput
                value={commandView.minAdjustmentMagnitude}
                onChange={(e) => setCommandField('minAdjustmentMagnitude', Number.parseInt(e.target.value))}
                inputClassName="sp-margin-xs-right input-sm number-input-sm"
              />
              <span className="input-label"> instance(s) </span>
            </div>
          </div>
        )}
        {Boolean(commandView.simple) && (
          <div className="row">
            <div className="col-md-2 sm-label-right">Cooldown</div>
            <div className="col-md-10 content-fields">
              <span className="form-control-static select-placeholder"> Wait at least </span>
              <NumberInput
                value={commandView.simple?.cooldown}
                onChange={(e) => setCommandField('simple.cooldown', Number.parseInt(e.target.value))}
                inputClassName="sp-margin-xs-xaxis input-sm number-input-sm"
              />
              <span className="input-label"> seconds before another scaling event </span>
            </div>
          </div>
        )}
        {Boolean(commandView.step?.estimatedInstanceWarmup) && operator !== 'Remove' && (
          <div className="row">
            <div className="col-md-2 sm-label-right">Warmup</div>
            <div className="col-md-10 content-fields">
              <span className="form-control-static select-placeholder">Instances need</span>
              <NumberInput
                value={commandView.step.estimatedInstanceWarmup}
                onChange={(e) => setCommandField('step.estimatedInstanceWarmup', Number.parseInt(e.target.value))}
                inputClassName="sp-margin-xs-xaxis input-sm number-input-sm"
              />
              <span className="input-label"> seconds to warm up after each step </span>
            </div>
          </div>
        )}
        {Boolean(commandView.step?.cooldown) && operator !== 'Remove' && (
          <div className="row">
            <div className="col-md-2 sm-label-right">
              <span className="sp-margin-xs-right">Cooldown</span>
              <HelpField id={`${commandView.cloudProvider || commandView.provider}.autoscaling.cooldown`} />
            </div>
            <div className="col-md-10 content-fields">
              <NumberInput
                value={commandView.step?.cooldown}
                onChange={(e) => setCommandField('step.cooldown', Number.parseInt(e.target.value))}
                inputClassName="sp-margin-xs-xaxis input-sm number-input-sm"
              />
              <span className="input-label"> seconds </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AMAZON_SERVERGROUP_DETAILS_SCALINGPOLICY_ADDITIONAL_SETTINGS_COMPONENT =
  'spinnaker.amazon.serverGroup.details.scalingPolicy.additionalSettings.component';
export const name = AMAZON_SERVERGROUP_DETAILS_SCALINGPOLICY_ADDITIONAL_SETTINGS_COMPONENT;

module(AMAZON_SERVERGROUP_DETAILS_SCALINGPOLICY_ADDITIONAL_SETTINGS_COMPONENT, []).component(
  'scalingPolicyAdditionalSettings',
  react2angular(withErrorBoundary(ScalingPolicyAdditionalSettings, 'scalingPolicyAdditionalSettings'), [
    'command',
    'isInstanceType',
    'isNew',
    'operator',
    'updateCommand',
  ]),
);
