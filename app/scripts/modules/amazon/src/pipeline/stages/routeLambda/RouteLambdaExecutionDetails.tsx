import React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from '@spinnaker/core';

export class RouteLambdaExecutionDetails extends React.Component<IExecutionDetailsSectionProps> {
  public static title = 'Route Lambda Traffic Stage';

  public render() {
    const { stage, name, current } = this.props;

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
