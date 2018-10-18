import { IStageConfigProps } from 'core/pipeline/config/stages/core/IStageConfigProps';
import * as React from 'react';
import { set } from 'lodash';

import { StageConfigField } from '../core/stageConfigField/StageConfigField';
import { IStage } from 'core/domain';
import { MapEditor } from '@spinnaker/core';

export interface IEvaluateVariablesStageConfigState {
  variables: any;
}

export class EvaluateVariablesStageConfig extends React.Component<
  IStageConfigProps,
  IEvaluateVariablesStageConfigState
> {
  public static getDerivedStateFromProps(
    props: IStageConfigProps,
    // state: IEvaluateVariablesStageConfigState,
  ): IEvaluateVariablesStageConfigState {
    const { stage } = props;
    const { variables } = stage;

    return {
      variables: variables || [],
    };
  }

  constructor(props: IStageConfigProps) {
    super(props);
    this.state = this.getState(props.stage);
  }

  private getState(stage: IStage): IEvaluateVariablesStageConfigState {
    const { variables } = stage;

    return {
      variables,
    };
  }

  private transform(value: any) {
    return Object.keys(value).reduce((acc, curr) => {
      acc.push({
        key: curr,
        value: value[curr],
      });
      return acc;
    }, []);
  }

  private stageFieldChanged = (fieldIndex: string, value: any) => {
    set(this.props.stage, fieldIndex, this.transform(value));
    this.props.stageFieldUpdated();
    this.forceUpdate();
  };

  private mapChanged = (key: string, values: { [key: string]: string }) => {
    this.stageFieldChanged(key, values);
  };

  public render() {
    const { variables } = this.state;
    return (
      <div className="form-horizontal">
        <StageConfigField label="Variables to evaluate">
          <MapEditor model={variables} allowEmpty={true} onChange={(v: any) => this.mapChanged('variables', v)} />
        </StageConfigField>
      </div>
    );
  }
}
