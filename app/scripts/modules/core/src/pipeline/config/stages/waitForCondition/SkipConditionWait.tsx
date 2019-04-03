import * as React from 'react';

import { IExecution, IExecutionStage } from 'core/domain';
import { Application } from 'core/application/application.model';
import { ReactInjector } from 'core/reactShims';
import { duration } from 'core/utils/timeFormatters';

export const DEFAULT_SKIP_WAIT_TEXT = 'The pipeline will proceed immediately, marking this stage completed.';

export interface ISkipConditionWaitProps {
  execution: IExecution;
  stage: IExecutionStage;
  application: Application;
}

const skipRemainingWait = (
  event: React.MouseEvent<HTMLElement>,
  stage: IExecutionStage,
  application: Application,
): void => {
  const { confirmationModalService, executionService } = ReactInjector;
  (event.target as HTMLElement).blur(); // forces closing of the popover when the modal opens
  const matcher = (execution: IExecution) => {
    const match = execution.stages.find(test => test.id === stage.id);
    return match.status !== 'RUNNING';
  };

  const data = { status: 'SKIPPED' };
  confirmationModalService.confirm({
    header: 'Really skip wait?',
    buttonText: 'Skip',
    body: stage.context.skipWaitText || DEFAULT_SKIP_WAIT_TEXT,
    submitMethod: () => {
      return executionService
        .patchExecution(this.props.execution.id, stage.id, data)
        .then(() => executionService.waitUntilExecutionMatches(this.props.execution.id, matcher))
        .then(updated => executionService.updateExecution(application, updated));
    },
  });
};

export const SkipConditionWait = ({ stage, application }: ISkipConditionWaitProps) => {
  const { conditions } = stage.outputs;
  return (
    <div>
      <div>
        {conditions && conditions.length > 0 && (
          <ul className="nostyle" style={{ marginBottom: '10px' }}>
            {conditions.map(({ name, description }: { name: string; description: string }, index: number) => (
              <li key={name + index}>
                <b>{name}</b>: {description}
              </li>
            ))}
          </ul>
        )}
        {stage.context.status === 'SKIPPED' && <span>(skipped after {duration(stage.runningTimeInMs)})</span>}
      </div>
      {stage.isRunning && (
        <div className="action-buttons">
          <button className="btn btn-xs btn-primary" onClick={event => skipRemainingWait(event, stage, application)}>
            <span style={{ marginRight: '5px' }} className="small glyphicon glyphicon-fast-forward" />
            Skip remaining wait
          </button>
        </div>
      )}
    </div>
  );
};
