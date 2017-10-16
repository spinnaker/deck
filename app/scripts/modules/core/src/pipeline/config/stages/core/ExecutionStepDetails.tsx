import * as React from 'react';

import { IExecutionStage } from 'core/domain';
import { StatusGlyph } from 'core/task/StatusGlyph';
import { displayableTasks } from 'core/task/displayableTasks.filter';
import { duration } from 'core/utils/timeFormatters';
import { robotToHuman } from 'core/presentation/robotToHumanFilter/robotToHuman.filter';

export interface IExecutionStepDetailsProps {
  stage: IExecutionStage;
}

export class ExecutionStepDetails extends React.Component<IExecutionStepDetailsProps> {
  public render() {
    return (
      <div className="col-md-9">
        <div className="row">
          <div className="col-md-9">
            <strong>Task</strong>
          </div>
          <div className="col-md-3 text-right">
            <strong>Duration</strong>
          </div>
        </div>
        { displayableTasks(this.props.stage.tasks).map((task) => (
          <div className="row">
            <div className="col-md-9">
              <span className="small"><StatusGlyph item={task}/></span> {robotToHuman(task.name)}
            </div>
            <div className="col-md-3 text-right">
              {duration(task.runningTimeInMs)}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
