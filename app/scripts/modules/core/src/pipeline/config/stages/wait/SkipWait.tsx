import * as React from 'react';

import {IExecution, IExecutionStage} from 'core/domain';
import {Application} from 'core/application/application.model';
import {ReactInjector} from 'core/reactShims';
import {duration} from 'core/utils/timeFormatters';
import {OrchestratedItemRunningTime} from 'core/delivery/executionGroup/execution/OrchestratedItemRunningTime';

export interface ISkipWaitProps {
  execution: IExecution;
  stage: IExecutionStage;
  application: Application;
}

export interface ISkipWaitState {
  remainingWait?: string;
}

export class SkipWait extends React.Component<ISkipWaitProps, ISkipWaitState> {
  private runningTime: OrchestratedItemRunningTime;

  constructor(props: ISkipWaitProps) {
    super(props);
    this.state = {
      remainingWait: null
    };
  }

  private setRemainingWait = (time: number): void => {
    this.setState({remainingWait: duration(this.props.stage.context.waitTime * 1000 - time) });
  };

  private skipRemainingWait = (e: React.MouseEvent<HTMLElement>): void => {
    const { confirmationModalService, executionService } = ReactInjector;
    (e.target as HTMLElement).blur(); // forces closing of the popover when the modal opens
    const stage = this.props.stage;
    const matcher = (execution: IExecution) => {
      const match = execution.stages.find((test) => test.id === stage.id);
      return match.status !== 'RUNNING';
    };

    const data = { skipRemainingWait: true };
    confirmationModalService.confirm({
      header: 'Really skip wait?',
      buttonText: 'Skip',
      body: '<p>The pipeline will proceed immediately, marking this stage completed.</p>',
      submitMethod: () => {
        return executionService.patchExecution(this.props.execution.id, stage.id, data)
          .then(() => executionService.waitUntilExecutionMatches(this.props.execution.id, matcher));
      }
    });
  };

  public componentWillReceiveProps() {
    this.runningTime.checkStatus();
  }

  public componentDidMount() {
    this.runningTime = new OrchestratedItemRunningTime(this.props.stage, (time: number) => this.setRemainingWait(time));
  }

  public componentWillUnmount() {
    this.runningTime.reset();
  }

  public render() {
    const stage = this.props.stage;
    return (
      <div>
        <div>
          <b>Wait time: </b>
          {stage.context.waitTime} seconds
          { stage.context.skipRemainingWait && (
            <span>(skipped after {duration(stage.runningTimeInMs)})</span>
          )}
        </div>
        { stage.isRunning && (
          <div>
            <div>
              <b>Remaining: </b>
              {this.state.remainingWait}
            </div>
            <div className="action-buttons">
              <button className="btn btn-xs btn-primary" onClick={this.skipRemainingWait}>
                <span style={{marginRight: '5px'}} className="small glyphicon glyphicon-fast-forward"/>
                Skip remaining wait
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
}
