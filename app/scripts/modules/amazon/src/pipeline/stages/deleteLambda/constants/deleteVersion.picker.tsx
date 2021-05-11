import React from 'react';

import { IFormikStageConfigInjectedProps } from '@spinnaker/core';

import { DeleteVersionList, IDeleteVersionConstant } from './deleteVersion.constants';

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

export class DeleteVersionPicker extends React.Component<IVersionPickerProps, IVersionPickerState> {
  constructor(props: IVersionPickerProps) {
    super(props);

    const { value } = this.props;

    const versionDetails = DeleteVersionList.filter((v: IDeleteVersionConstant) => v.value === value)[0];

    this.state = {
      label: versionDetails.label,
      value: versionDetails.value,
      description: versionDetails.description,
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
