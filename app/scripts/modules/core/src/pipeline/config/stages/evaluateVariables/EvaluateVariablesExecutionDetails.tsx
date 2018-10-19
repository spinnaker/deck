import * as React from 'react';

import { StageExecutionLogs, StageFailureMessage } from 'core/pipeline/details';
import { ExecutionDetailsSection, IExecutionDetailsSectionProps } from 'core/pipeline/config/stages/core';

export interface IEvaluatedVariables {
  key: string;
  value: string;
}

export function EvaluateVariablesExecutionDetails(props: IExecutionDetailsSectionProps) {
  // const sampleData = [
  //   {
  //      'key' : 'testing',
  //      'value' : 'EMILY'
  //   },
  //   {
  //      'value' : 'blah',
  //      'key' : 'second'
  //   }
  // ]

  // props.stage.context.variables = props.stage.context.variables || sampleData;

  const {
    stage: { context = {}, outputs = {} },
  } = props;

  const evaluatedVariables = context.variables ? (
    <div>
      <dl>
        {context.variables.map((evalPair: IEvaluatedVariables) => (
          <React.Fragment key={evalPair.key}>
            <dt>{evalPair.key}</dt>
            <dd>{outputs[evalPair.key] || '-'}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  ) : (
    <div>
      <b>No variables were evaluated.</b>
    </div>
  );

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      {evaluatedVariables}
      <StageFailureMessage stage={props.stage} message={props.stage.failureMessage} />
      <StageExecutionLogs stage={props.stage} />
    </ExecutionDetailsSection>
  );
}

export namespace EvaluateVariablesExecutionDetails {
  export const title = 'evaluateVariablesConfig';
}
