import React from 'react';

import { IFormikStageConfigInjectedProps } from '@spinnaker/core';

import { DeploymentStrategyList, IStrategyConstant } from './strategy.constants';

export interface IVersionPickerProps {
  config: IFormikStageConfigInjectedProps;
  value: string;
  showingDetails: boolean;
}

export interface IVersionPickerState {
  value: string;
  label: string;
  description: string;
}

export class DeploymentStrategyPicker extends React.Component<IVersionPickerProps, IVersionPickerState> {
  constructor(props: IVersionPickerProps) {
    super(props);

    const { value } = this.props;

    const strategyDetails = DeploymentStrategyList.filter((v: IStrategyConstant) => v.value === value)[0];

    this.state = {
      label: strategyDetails.label,
      value: strategyDetails.value,
      description: strategyDetails.description,
    };
  }

  public render() {
    return (
      <div>
        <b> {this.state.label} </b>
        <br />
        <small> {this.state.description} </small>
      </div>
    );
  }
}
