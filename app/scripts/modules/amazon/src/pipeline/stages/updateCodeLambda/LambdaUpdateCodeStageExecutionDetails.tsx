import React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from '@spinnaker/core';

export class LambdaUpdateCodeExecutionDetails extends React.Component<IExecutionDetailsSectionProps> {
  public static title = 'Lambda Update Code Stage';

  public render() {
    const { stage, current, name } = this.props;
    return (
      <ExecutionDetailsSection name={name} current={current}>
        <StageFailureMessage stage={stage} message={stage.outputs.failureMessage} />
        <div>
          <p>
            <b> Function Name: </b> {stage.outputs.functionName ? stage.outputs.functionName : 'N/A'}{' '}
          </p>
          <p>
            <b> Function ARN: </b> {stage.outputs.functionARN ? stage.outputs.functionARN : 'N/A'}{' '}
          </p>
        </div>
      </ExecutionDetailsSection>
    );
  }
}
