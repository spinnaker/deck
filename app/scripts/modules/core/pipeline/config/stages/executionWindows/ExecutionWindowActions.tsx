import * as React from 'react';
import autoBindMethods from 'class-autobind-decorator';

import {IExecution, IExecutionStage} from 'core/domain';
import {Application} from 'core/application/application.model';
import {confirmationModalService} from 'core/confirmationModal/confirmationModal.service';
import {executionService} from 'core/delivery/service/execution.service';
import {timePickerTime} from 'core/utils/timeFormatters';
import {SystemTimezone} from 'core/utils/SystemTimezone';
import {DAYS_OF_WEEK} from './daysOfWeek';

interface IProps {
  execution: IExecution;
  stage: IExecutionStage;
  application: Application;
}

interface IState {
  dayText: string;
}

interface IExecutionWindowWhitelistEntry {
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
}

@autoBindMethods
export class ExecutionWindowActions extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    const days = props.stage.context.restrictedExecutionWindow.days;
    let dayText = 'Everyday';
    if (days && days.length > 0) {
      dayText = this.replaceDays(days).join(', ');
    }
    this.state = {
      dayText: dayText,
    };
  }

  private finishWaiting(e: React.MouseEvent<HTMLElement>): void {
    (e.target as HTMLElement).blur(); // forces closing of the popover when the modal opens
    const stage = this.props.stage,
          executionId = this.props.execution.id;

    const matcher = (execution: IExecution) => {
      const match = execution.stages.find((test) => test.id === stage.id);
      return match.status !== 'RUNNING';
    };

    const data = {skipRemainingWait: true};
    confirmationModalService.confirm({
      header: 'Really skip execution window?',
      buttonText: 'Skip',
      body: '<p>The pipeline will proceed immediately, continuing to the next step in the stage.</p>',
      submitMethod: () => {
        return executionService.patchExecution(executionId, stage.id, data)
          .then(() => executionService.waitUntilExecutionMatches(executionId, matcher));
      }
    });
  }

  private replaceDays(days: number[]): string[] {
    const daySet = new Set(days);
    return DAYS_OF_WEEK.filter(day => daySet.has(day.ordinal)).map(day => day.label);
  }

  public render() {
    const stage = this.props.stage;
    return (
      <div>
        <h5>Execution Windows Configuration</h5>
        <strong>Stage execution can only run:</strong>
        <dl className="dl-narrow dl-horizontal">
          {stage.context.restrictedExecutionWindow.whitelist.map((entry: IExecutionWindowWhitelistEntry, index: number) => {
            return (
              <div key={index}>
                <dt>From</dt>
                <dd>
                  {timePickerTime({hours: entry.startHour, minutes: entry.startMin})}
                  <strong style={{display: 'inline-block', margin: '0 5px'}}> to </strong>
                  {timePickerTime({hours: entry.endHour, minutes: entry.endMin})}
                  <strong> <SystemTimezone/> </strong>
                </dd>
              </div>
            );
          })}
          <dt>On</dt>
          <dd>{this.state.dayText}</dd>
        </dl>
        {stage.context.skipRemainingWait && (
          <div>
            <span>(skipped </span>
            {stage.context.lastModifiedBy && (
              <span> by {stage.context.lastModifiedBy}</span>
            )}
            )
          </div>
        )}
        {stage.isSuspended && (
          <div className="action-buttons">
            <button className="btn btn-xs btn-primary" onClick={this.finishWaiting}>
              <span style={{marginRight: '5px'}} className="small glyphicon glyphicon-fast-forward"/>
              Skip remaining window
            </button>
          </div>
        )}
      </div>
    );
  }
}
