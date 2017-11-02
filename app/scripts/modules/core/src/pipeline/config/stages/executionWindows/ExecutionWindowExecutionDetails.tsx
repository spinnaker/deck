import * as React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps } from 'core/pipeline/config/stages/core';
import { StageExecutionLogs, StageFailureMessage } from 'core/delivery/details';
import { ExecutionWindowActions } from './ExecutionWindowActions';

export function ExecutionWindowExecutionDetails(props: IExecutionDetailsSectionProps) {
  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      <ExecutionWindowActions application={props.application} execution={props.execution} stage={props.stage}/>
      <StageFailureMessage stage={props.stage} message={props.stage.failureMessage} />
      <StageExecutionLogs stage={props.stage} />
    </ExecutionDetailsSection>
  );
};

export namespace ExecutionWindowExecutionDetails {
  export const title = 'windowConfig';
}
