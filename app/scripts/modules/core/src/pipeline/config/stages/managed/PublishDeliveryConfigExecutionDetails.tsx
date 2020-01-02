import React from 'react';
import { get } from 'lodash';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from 'core/pipeline';
import { IGitTrigger } from 'core/domain';

export function PublishDeliveryConfigExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage } = props;
  const trigger = props.execution.trigger as IGitTrigger;
  const errorDetailsAvailable = stage.isFailed && !stage.failureMessage && get(stage.context, 'error') != null;

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      <div className="row">
        <div className="col-md-12">
          <h5>Publish Managed Delivery Manifest Stage Configuration</h5>
          <dl className="dl-narrow dl-horizontal">
            <dt>SCM</dt>
            <dd>{trigger.source}</dd>
            <dt>Project</dt>
            <dd>{trigger.project}</dd>
            <dt>Repository</dt>
            <dd>{trigger.slug}</dd>
            {stage.context.directory && <dt>Directory</dt>}
            {stage.context.directory && <dd>{stage.context.directory}</dd>}
            {stage.context.manifest && <dt>Manifest</dt>}
            {stage.context.manifest && <dd>{stage.context.manifest}</dd>}
            {stage.context.ref && <dt>Git ref</dt>}
            {stage.context.ref && <dd>{stage.context.ref}</dd>}
          </dl>
        </div>
      </div>

      {errorDetailsAvailable && (
        <div>
          <div className="alert alert-danger">
            Stage failed with the following error:
            <pre>${stage.context.error}</pre>
          </div>
        </div>
      )}

      <StageFailureMessage stage={props.stage} message={props.stage.failureMessage} />
    </ExecutionDetailsSection>
  );
}

// TODO: refactor this to not use namespace
// eslint-disable-next-line
export namespace PublishDeliveryConfigExecutionDetails {
  export const title = 'publishDeliveryConfig';
}
