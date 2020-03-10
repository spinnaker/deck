import React from 'react';
import { set } from 'lodash';

import { IStageConfigProps, StageConfigField } from '../common';
import { IPreconfiguredJobParameter } from './preconfiguredJob.reader';

export class PreconfiguredJobStageConfig extends React.Component<IStageConfigProps> {
  private parameterFieldChanged = (fieldIndex: string, value: any) => {
    set(this.props.stage, `parameters.${fieldIndex}`, value);
    this.props.stageFieldUpdated();
    this.forceUpdate();
  };

  public render() {
    const {
      stage: { parameters = {} },
      configuration,
    } = this.props;

    return (
      <div className="form-horizontal">
        {configuration.parameters.map((parameter: IPreconfiguredJobParameter) => (
          <StageConfigField key={parameter.name} label={parameter.label}>
            <input
              type="text"
              className="form-control input-sm"
              value={parameters[parameter.name]}
              onChange={e => this.parameterFieldChanged(parameter.name, e.target.value)}
            />
          </StageConfigField>
        ))}
      </div>
    );
  }
}
