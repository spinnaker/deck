import * as React from 'react';

import {
  IExecutionDetailsSectionProps,
  ExecutionDetailsSection,
  StageExecutionLogs,
  StageFailureMessage,
} from 'core/pipeline';
export function ApplyEntityTagsExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage, current } = props;

  const entityRef = stage.context.entityRef || {};
  const tags = stage.context.tags || {};

  const entityRefSection = (
    <div className="row">
      <div className="col-md-12">
        Entity Reference
        <dl className="dl-narrow dl-horizontal">
          {entityRef.cloudProvider && <dt>Provider</dt>}
          {entityRef.cloudProvider && <dd>{entityRef.cloudProvider}</dd>}
          {entityRef.entityType && <dt>Entity Type</dt>}
          {entityRef.entityType && <dd>{entityRef.entityType}</dd>}
          {entityRef.entityId && <dt>Entity ID</dt>}
          {entityRef.entityId && <dd>{entityRef.entityId}</dd>}
          {entityRef.account && <dt>Account</dt>}
          {entityRef.account && <dd>{entityRef.account}</dd>}
          {entityRef.region && <dt>Region</dt>}
          {entityRef.region && <dd>{entityRef.region}</dd>}
          {entityRef.vpcId && <dt>VPC ID</dt>}
          {entityRef.vpcId && <dd>{entityRef.vpcId}</dd>}
        </dl>
      </div>
    </div>
  );

  const tagsSection = (
    <div className="row">
      <div className="col-md-12">
        Tags
        <dl className="dl-narrow dl-horizontal">
          {tags.map(({ name, value }: any) => {
            if (typeof value === 'object') {
              try {
                value = JSON.stringify(value);
              } catch (e) {}
            }
            return (
              <React.Fragment key={name}>
                <dt title={name}>{name}</dt>
                <dd title={value}>{value}</dd>
              </React.Fragment>
            );
          })}
        </dl>
      </div>
    </div>
  );

  return (
    <ExecutionDetailsSection name={props.name} current={current}>
      {entityRefSection}
      {tagsSection}
      <StageFailureMessage stage={stage} message={stage.failureMessage} />
      <StageExecutionLogs stage={stage} />
    </ExecutionDetailsSection>
  );
}

export namespace ApplyEntityTagsExecutionDetails {
  export const title = 'applyEntityTagsConfig';
}
