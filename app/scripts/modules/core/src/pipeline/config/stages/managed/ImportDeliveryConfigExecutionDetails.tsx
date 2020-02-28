import React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from 'core/pipeline';
import { IGitTrigger } from 'core/domain';
import { CollapsibleSection, Markdown } from 'core/presentation';
import { SETTINGS } from 'core/config';

const NOT_FOUND = 'Not found';

interface IDeliveryConfigImportErrorDetails {
  error: string;
  message: string;
  pathExpression: string;
}

interface IDeliveryConfigImportError {
  message: string;
  details?: IDeliveryConfigImportErrorDetails;
}

const CustomErrorMessage = (message: string, debugDetails?: string) => {
  return (
    <div>
      <div className="alert alert-danger">
        <b>There was an error parsing your delivery config file.</b>
        <br />
        <Markdown message={message} style={{ wordBreak: 'break-all' }} />
        <br />
        {debugDetails && (
          <CollapsibleSection heading={({ chevron }) => <span>{chevron} Debug Details</span>}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{debugDetails}</pre>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
};

function buildCustomErrorMessage(error: IDeliveryConfigImportError) {
  if (!error) {
    return null;
  }

  if (!error.details) {
    return CustomErrorMessage(error.message);
  }

  // Replace dots with slashes for paths because it feels more familiar. Also ditch the very first slash/dot as it just adds noise.
  const pathExpression = error.details.pathExpression.substring(1).replace(/\./g, '/');
  // Turn off linter for the block below because it wants CamelCase property names.
  /* eslint-disable @typescript-eslint/camelcase */
  const errorMessageMap = {
    missing_property: `The following property is missing: <br/> \`${pathExpression}\``,
    invalid_type: `The type of the following property is invalid: <br/> \`${pathExpression}\``,
    invalid_format: `The format of the following property is invalid: <br/> \`${pathExpression}\``,
    invalid_value: `The value of the following property is invalid: <br/> \`${pathExpression}\``,
  };
  /* eslint-enable */
  const errorMessage = errorMessageMap[error.details.error] || 'Unknown error';
  return CustomErrorMessage(errorMessage, error.details.message);
}

export function ImportDeliveryConfigExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage } = props;
  const trigger = props.execution.trigger as IGitTrigger;
  const manifestPath =
    SETTINGS.managedDelivery?.manifestBasePath +
    '/' +
    (stage.context.manifest ?? SETTINGS.managedDelivery?.defaultManifest);

  const customErrorMessage = buildCustomErrorMessage(stage.context.error as IDeliveryConfigImportError);

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      <div className="row">
        <div className="col-md-12">
          <dl className="dl-narrow dl-horizontal">
            <dt>SCM</dt>
            <dd>{trigger.source ?? NOT_FOUND}</dd>
            <dt>Project</dt>
            <dd>{trigger.project ?? NOT_FOUND}</dd>
            <dt>Repository</dt>
            <dd>{trigger.slug ?? NOT_FOUND}</dd>
            <dt>Manifest Path</dt>
            <dd>{manifestPath ?? NOT_FOUND}</dd>
            <dt>Branch</dt>
            <dd>{trigger.branch ?? NOT_FOUND}</dd>
            <dt>Commit</dt>
            <dd>{trigger.hash?.substring(0, 7) ?? NOT_FOUND}</dd>
          </dl>
        </div>
      </div>

      {customErrorMessage ? customErrorMessage : <StageFailureMessage stage={stage} />}
    </ExecutionDetailsSection>
  );
}

// TODO: refactor this to not use namespace
// eslint-disable-next-line
export namespace ImportDeliveryConfigExecutionDetails {
  export const title = 'Configuration';
}
