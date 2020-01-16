import * as React from 'react';
import { get } from 'lodash';

import {
  ExecutionDetailsSection,
  IExecutionDetailsSectionProps,
  StageFailureMessage,
  SETTINGS,
  IExecutionStage,
} from '@spinnaker/core';

function interpolate(text: string, stage: IExecutionStage) {
  let newText = text;
  const re = /{{([^{}]*)}}/;

  while (-1 != newText.search(re)) {
    newText = newText.replace(re, (substr: string) => {
      return get(stage, substr.substring(2, substr.length - 2), undefined);
    });
  }

  return newText;
}

export function HuaweiCloudBakeStageExecutionDetails(props: IExecutionDetailsSectionProps) {
  const { stage, execution } = props;

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      <div className="step-section-details">
        <div className="row">
          <div className="col-md-12">
            <dl className="dl-horizontal">
              <dt>Base OS</dt>
              <dd>{stage.context.baseOs}</dd>
              <dt>Region</dt>
              <dd>{stage.context.region}</dd>
              <dt>Package</dt>
              <dd>{stage.context.package}</dd>
              <dt>Image</dt>
              <dd>{stage.context.ami}</dd>
              <dt>Label</dt>
              <dd>{stage.context.baseLabel}</dd>
              <dt>Rebake</dt>
              <dd>{execution.trigger.rebake || stage.context.rebake || false}</dd>
              <dt>Template</dt>
              <dd>{stage.context.templateFileName}</dd>
            </dl>
          </div>
        </div>
      </div>

      <StageFailureMessage stage={stage} message={stage.failureMessage} />

      <div className="row">
        <div className="col-md-12">
          <div className="alert alert-{{stage.isFailed ? 'danger' : 'info'}}">
            {stage.context.previouslyBaked && <div>No changes detected; reused existing bake</div>}
            <a target="_blank" href={interpolate(SETTINGS.bakeryDetailUrl, stage)}>
              View Bakery Details1
            </a>
          </div>
        </div>
      </div>
    </ExecutionDetailsSection>
  );
}

// eslint-disable-next-line
export namespace HuaweiCloudBakeStageExecutionDetails {
  export const title = 'huaweiCloudBakeStageConfig';
}
