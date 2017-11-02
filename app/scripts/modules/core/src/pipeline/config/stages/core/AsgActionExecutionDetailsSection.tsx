import * as React from 'react';

import { StageExecutionLogs, StageFailureMessage } from 'core/delivery/details';
import { ExecutionDetailsSection, IExecutionDetailsSectionProps } from '../core';
import { NgReact } from 'core/reactShims';

export function AsgActionExecutionDetailsSection(props: IExecutionDetailsSectionProps & { action: string }) {
  const { AccountTag } = NgReact;
  const { action, stage } = props;
  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      <div className="row">
        <div className="col-md-9">
          <dl className="dl-narrow dl-horizontal">
            <dt>Account</dt>
            <dd><AccountTag account={stage.context.credentials}/></dd>
            <dt>Region</dt>
            <dd>{stage.context.region}</dd>
            <dt>Server Group</dt>
            <dd>{stage.context.serverGroupName}</dd>
          </dl>
        </div>
      </div>
      <StageFailureMessage stage={stage} message={stage.failureMessage} />
      {stage.isCompleted && stage.context.serverGroupName && (
        <div className="row">
          <div className="col-md-12">
            <div className="well alert alert-info">
              <strong>{action}: </strong>
              {stage.context.serverGroupName}
            </div>
          </div>
        </div>
      )}
      <StageExecutionLogs stage={stage} />
    </ExecutionDetailsSection>
  );
};
