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
  public static getDerivedStateFromProps(props: IStageConfigProps): IEvaluateVariablesStageConfigState {
    const { stage } = props;
    const { variables } = stage;

    return {
      variables: EvaluateVariablesStageConfig.compress(variables || []),
    };
  }

  private static compress(variables: any) {
    return variables.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }

  private static expand(value: any) {
    return Object.keys(value).reduce((acc, curr) => {
      acc.push({
        key: curr,
        value: value[curr],
      });
      return acc;
    }, []);
  }

  constructor(props: IStageConfigProps) {
    super(props);
    this.state = this.getState(props.stage);
  }

  private getState(stage: IStage): IEvaluateVariablesStageConfigState {
    const { variables } = stage;
    return {
      variables: EvaluateVariablesStageConfig.compress(variables),
    };
  }

  private stageFieldChanged = (fieldIndex: string, value: any) => {
    set(this.props.stage, fieldIndex, EvaluateVariablesStageConfig.expand(value));
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
