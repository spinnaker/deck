import * as React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from 'core/pipeline';

export function GremlinExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage } = props;

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      <div className="row">
        <div className="col-md-12">
          <h5>Gremlin Stage Configuration</h5>
          <dl className="dl-narrow dl-horizontal">
            {stage.context.gremlinCommandTemplateId && <dt>Command Template ID</dt>}
            {stage.context.gremlinCommandTemplateId && <dd>{stage.context.gremlinCommandTemplateId}</dd>}
          </dl>
          <dl className="dl-narrow dl-horizontal">
            {stage.context.gremlinTargetTemplateId && <dt>Target Template ID</dt>}
            {stage.context.gremlinTargetTemplateId && <dd>{stage.context.gremlinTargetTemplateId}</dd>}
          </dl>
          <dl className="dl-narrow dl-horizontal">
            {stage.context.gremlinApiKey && <dt>API Key</dt>}
            {stage.context.gremlinApiKey && <dd>{stage.context.gremlinApiKey}</dd>}
          </dl>
        </div>
      </div>
      <StageFailureMessage stage={props.stage} message={props.stage.failureMessage} />
    </ExecutionDetailsSection>
  );
}

export namespace GremlinExecutionDetails {
  export const title = 'gremlinConfig';
}
