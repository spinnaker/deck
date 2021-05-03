import React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from '@spinnaker/core';

export class DeleteLambdaExecutionDetails extends React.Component<IExecutionDetailsSectionProps> {
  public static title = 'Delete Lambda Stage';

  public render() {
    const { stage, name, current } = this.props;

    return (
      <ExecutionDetailsSection name={name} current={current}>
        <StageFailureMessage stage={stage} message={stage.outputs.failureMessage} />
        <div>
          <p>
            <b> Status: </b> {stage.outputs.deleteTask === 'done' ? 'COMPLETE' : stage.outputs.deleteTask}{' '}
          </p>
          <p>
            <b> Deleted Version: </b>{' '}
            {stage.outputs['deleteTask:deleteVersion'] ? stage.outputs['deleteTask:deleteVersion'] : 'N/A'}
          </p>
        </div>
      </ExecutionDetailsSection>
    );
  }
}
