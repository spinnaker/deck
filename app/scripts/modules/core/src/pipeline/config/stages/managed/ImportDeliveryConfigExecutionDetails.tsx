import React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from 'core/pipeline';
import { IGitTrigger } from 'core/domain';
import { SETTINGS } from 'core/config';

export function ImportDeliveryConfigExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage } = props;
  const trigger = props.execution.trigger as IGitTrigger;
  const errorDetailsAvailable = stage.isFailed && !stage.failureMessage && stage.context.error;
  const manifestDirectory = SETTINGS.managedDelivery?.manifestBasePath + (stage.context.directory ?? '');
  const manifestFilename = stage.context.manifest ?? SETTINGS.managedDelivery?.defaultManifest;
  const gitRef = stage.context.ref ?? 'refs/heads/master';

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      <div className="row">
        <div className="col-md-12">
          <h5>Import Delivery Config Stage Configuration</h5>
          <dl className="dl-narrow dl-horizontal">
            <dt>SCM</dt>
            <dd>{trigger.source}</dd>
            <dt>Project</dt>
            <dd>{trigger.project}</dd>
            <dt>Repository</dt>
            <dd>{trigger.slug}</dd>
            <dt>Directory</dt>
            <dd>{manifestDirectory}</dd>
            <dt>Manifest</dt>
            <dd>{manifestFilename}</dd>
            <dt>Git ref</dt>
            <dd>{gitRef}</dd>
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
export namespace ImportDeliveryConfigExecutionDetails {
  export const title = 'Import Delivery Config';
}
