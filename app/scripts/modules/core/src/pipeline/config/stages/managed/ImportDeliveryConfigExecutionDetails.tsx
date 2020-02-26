import React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from 'core/pipeline';
import { IGitTrigger } from 'core/domain';
import { SETTINGS } from 'core/config';

const NOT_FOUND = 'Not found';

export class DeliveryConfigImportErrorDetails {
  error: string;
  message: string;
  pathExpression: string;

  getErrorMessage() {
    let errorMessage = 'Error parsing delivery config: <br/>';
    switch (this.error) {
      case 'missing_property':
        errorMessage += 'The following property is missing: ' + this.pathExpression;
        break;

      case 'invalid_type':
        errorMessage += 'The type of property `' + this.pathExpression + '` is invalid.';
        break;

      case 'invalid_format':
        errorMessage += 'The format of property `' + this.pathExpression + '` is invalid.';
        break;

      case 'invalid_value':
        errorMessage += 'The value of property `' + this.pathExpression + '` is invalid.';
        break;

      default:
        errorMessage += this.message;
        break;
    }
    return errorMessage;
  }
}

export interface IDeliveryConfigImportError {
  message: string;
  details?: DeliveryConfigImportErrorDetails;
}

export function ImportDeliveryConfigExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage } = props;
  const trigger = props.execution.trigger as IGitTrigger;
  const manifestPath =
    SETTINGS.managedDelivery?.manifestBasePath +
    '/' +
    (stage.context.manifest ?? SETTINGS.managedDelivery?.defaultManifest);

  let errorMessage;
  if (stage.context.error instanceof Map) {
    const importError = stage.context.error as IDeliveryConfigImportError;
    errorMessage = importError.details ? importError.details.getErrorMessage() : importError.message;
  } else {
    errorMessage = stage.context.error;
  }

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

      <StageFailureMessage stage={stage} message={errorMessage || stage.failureMessage} />
    </ExecutionDetailsSection>
  );
}

// TODO: refactor this to not use namespace
// eslint-disable-next-line
export namespace ImportDeliveryConfigExecutionDetails {
  export const title = 'Configuration';
}
