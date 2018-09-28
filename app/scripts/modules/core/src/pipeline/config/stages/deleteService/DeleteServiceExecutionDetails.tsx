import * as React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps } from 'core/pipeline/config/stages/core';
import { AccountTag } from 'core/account';
import { StageFailureMessage } from 'core/pipeline/details';

export function DeleteServiceExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage } = props;
  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      <div className="row">
        <div className="col-md-9">
          <dl className="dl-narrow dl-horizontal">
            <dt>Account</dt>
            <dd>
              <AccountTag account={stage.context.credentials} />
            </dd>
            <dt>Region</dt>
            <dd>{stage.context.region}</dd>
          </dl>
        </div>
      </div>
      <StageFailureMessage stage={props.stage} message={props.stage.failureMessage} />
    </ExecutionDetailsSection>
  );
}

export namespace DeleteServiceExecutionDetails {
  export const title = 'deleteServiceConfig';
}
