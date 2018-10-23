import * as React from 'react';
import { map, set } from 'lodash';

import { IStageConfigProps, StageConfigField, MapEditor } from 'core';

export interface IEvaluateVariablesStageConfigState {
  variables: any;
}

export class EvaluateVariablesStageConfig extends React.Component<
  IStageConfigProps,
  IEvaluateVariablesStageConfigState
> {
  private expand(variables: any) {
    return map(variables, (value, key) => ({ key, value }));
  }

  private stageFieldChanged = (fieldIndex: string, value: any) => {
    set(this.props.stage, fieldIndex, this.expand(value));
    this.props.stageFieldUpdated();
    this.forceUpdate();
  };

  private mapChanged = (key: string, values: { [key: string]: string }) => {
    this.stageFieldChanged(key, values);
  };

  public render() {
    const {
      stage: { variables = [] },
    } = this.props;

    // Flattens an array of objects {key, value} into a single object with the respective keys/values
    const variablesObject = variables.reduce(
      (acc: any, { key, value }: any) => Object.assign(acc, { [key]: value }),
      {},
    );

    return (
      <div className="form-horizontal">
        <StageConfigField label="Variables to evaluate">
          <MapEditor model={variablesObject} allowEmpty={true} onChange={(v: any) => this.mapChanged('variables', v)} />
        </StageConfigField>
      </div>
    );
  }
}
