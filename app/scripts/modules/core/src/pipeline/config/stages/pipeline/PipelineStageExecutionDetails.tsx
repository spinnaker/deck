import React from 'react';
import { UISref } from '@uirouter/react';

import { IExecutionDetailsSectionProps, ExecutionDetailsSection, StageFailureMessage } from 'core/pipeline';
import { IPipeline } from 'core/domain';
import { useLatestPromise } from 'core/presentation/hooks/useLatestPromise.hook';

export function PipelineStageExecutionDetails(props: IExecutionDetailsSectionProps) {
  const {
    application,
    execution,
    stage: { context = {} },
    stage,
    name,
    current,
  } = props;

  const { result: pipelineConfigs } = useLatestPromise<IPipeline[]>(() => {
    application.pipelineConfigs.activate();
    return application.pipelineConfigs.ready();
  }, []);
  const pipelineConfig =
    pipelineConfigs && context.pipeline && pipelineConfigs.find(({ id }) => context.pipeline === id);

  return (
    <ExecutionDetailsSection name={name} current={current}>
      <div className="row">
        <div className="col-md-12">
          <h5>Pipeline Stage Configuration</h5>
          <dl className="dl-narrow dl-horizontal">
            <dt>Application</dt>
            <dd>{context.application}</dd>
            <dt>Pipeline</dt>
            <dd>{(pipelineConfig && pipelineConfig.name) || context.executionName || 'N/A'}</dd>
            <dt>Status</dt>
            <dd>{context.status || 'N/A'}</dd>
          </dl>
        </div>
      </div>
      <StageFailureMessage stage={stage} message={stage.failureMessage} />
      <div className="row">
        <div className="col-md-12">
          <div className="well alert alert-info">
            {(stage.hasNotStarted || !context.executionId) && <span>No Execution Started</span>}
            {!stage.hasNotStarted && context.executionId && (
              <UISref
                to="home.applications.application.pipelines.executionDetails.execution"
                params={{
                  application: stage.context.application,
                  executionId: stage.context.executionId,
                  executionParams: { application: application.name, executionId: execution.id },
                }}
                options={{ inherit: false, reload: 'home.applications.application.pipelines.executionDetails' }}
              >
                <a target="_self">View Pipeline Execution</a>
              </UISref>
            )}
          </div>
        </div>
      </div>
    </ExecutionDetailsSection>
  );
}

// TODO: refactor this to not use namespace
// eslint-disable-next-line
export namespace PipelineStageExecutionDetails {
  export const title = 'pipelineConfig';
}
