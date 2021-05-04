import React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from '@spinnaker/core';

export class InvokeLambdaExecutionDetails extends React.Component<IExecutionDetailsSectionProps> {
  public static title = 'Invoke Lambda Stage';

  public render() {
    const { stage, current, name } = this.props;

    return (
      <ExecutionDetailsSection name={name} current={current}>
        <StageFailureMessage stage={stage} message={stage.outputs.failureMessage} />
        <div>
          <p> Function Name: {stage.outputs.functionName ? stage.outputs.functionName : 'N/A'} </p>
          <p>
            {' '}
            Deployed Alias:{' '}
            {stage.outputs['deployment:aliasDeployed'] ? stage.outputs['deployment:aliasDeployed'] : 'N/A'}{' '}
          </p>
          <p>
            {' '}
            Deployed Major Version:{' '}
            {stage.outputs['deployment:majorVersionDeployed']
              ? stage.outputs['deployment:majorVersionDeployed']
              : 'N/A'}{' '}
          </p>
        </div>
      </ExecutionDetailsSection>
    );
  }
}
