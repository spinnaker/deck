import * as React from 'react';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps } from 'core/pipeline/config/stages/core';
import { HelpField } from 'core/help/HelpField';
import { AccountTag } from 'core/account';
import { StageExecutionLogs, StageFailureMessage } from 'core/pipeline/details';

export function RollbackClusterExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage } = props;

  const imagesToRestore = stage.context.imagesToRestore && stage.context.imagesToRestore.map((entry: any) => {
    const imageDetails = entry.buildNumber ? '#' + entry.buildNumber : entry.image;
    const method = (entry.rollbackMethod === 'EXPLICIT') ? 'previous server group' : 'new server group';
    const helpId = `cluster.rollback.${entry.rollbackMethod.toLowerCase()}`
    return (
      <div key={entry.region}>
        <dt>
          {entry.region}
        </dt>
        <dd>
          {imageDetails} via {method} <HelpField id={helpId}/>
        </dd>
      </div>
    );
  });

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      <div className="row">
        <div className="col-md-9">
          <dl className="dl-narrow dl-horizontal">
            <dt>Account</dt>
            <dd><AccountTag account={stage.context.credentials}/></dd>
            <dt>Cluster</dt>
            <dd>{stage.context.cluster}</dd>
          </dl>
        </div>
      </div>

      <div className="row">
        <div className="col-md-offset-1 col-md-11">
          <strong>Rollback Targets</strong>
        </div>
        <div className="col-md-12">
          <dl className="dl-narrow dl-horizontal">
            {imagesToRestore}
          </dl>
        </div>
      </div>

      <StageFailureMessage stage={props.stage} message={props.stage.failureMessage}/>
      <StageExecutionLogs stage={props.stage}/>
    </ExecutionDetailsSection>
  );
};

export namespace RollbackClusterExecutionDetails {
  export const title = 'rollbackClusterConfig';
}
