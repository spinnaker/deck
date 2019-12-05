import * as React from 'react';
import { TaskExecutor, ReactInjector, ITaskMonitorConfig } from '@spinnaker/core';
import { IScheduledAction } from 'tencent/domain';

export interface IScheduledActionProps {
  action: IScheduledAction;
  application?: any;
  serverGroup?: any;
}

export class ScheduledAction extends React.Component<IScheduledActionProps> {
  private deleteScheduledAction(action: IScheduledAction): void {
    const { application, serverGroup } = this.props;
    const taskMonitor: ITaskMonitorConfig = {
      application: application,
      title: 'Deleting scaling policy ' + action.scheduledActionId,
      onTaskComplete: () => application.serverGroups.refresh(),
    };

    ReactInjector.confirmationModalService.confirm({
      header: `Really delete ${action.scheduledActionId}?`,
      buttonText: 'Delete scaling policy',
      account: serverGroup.account,
      provider: 'tencent',
      taskMonitorConfig: taskMonitor,
      submitMethod: () => {
        return TaskExecutor.executeTask({
          job: [
            {
              type: 'deleteTencentScheduledAction',
              applications: application.name,
              account: serverGroup.account,
              accountName: serverGroup.account,
              cloudProvider: 'tencent',
              region: serverGroup.region,
              serverGroupName: serverGroup.name,
              scheduledActionId: action.scheduledActionId,
              credentials: serverGroup.account,
            },
          ],
          application: application,
          description: 'Delete Scheduled Action for ' + serverGroup.name,
        });
      },
    });
  }
  public render() {
    const { action } = this.props;
    return (
      <div>
        <dl className="horizontal-when-filters-collapsed" style={{ marginBottom: '20px' }}>
          <dt>Schedule Action ID/Name</dt>
          <dd>
            {action.scheduledActionId}({action.scheduledActionName})
          </dd>
          <dt>Start Time</dt>
          <dd>{action.startTime}</dd>
          <dt>Schedule</dt>
          <dd>{action.recurrence}</dd>
          <dt>End Time</dt>
          <dd>{action.endTime}</dd>
          {action.minSize !== undefined && <dt>Min Size</dt>}
          {action.minSize !== undefined && <dd>{action.minSize}</dd>}
          {action.maxSize !== undefined && <dt>Max Size</dt>}
          {action.maxSize !== undefined && <dd>{action.maxSize}</dd>}
          {action.desiredCapacity !== undefined && <dt>Desired Size</dt>}
          {action.desiredCapacity !== undefined && <dd>{action.desiredCapacity}</dd>}
        </dl>
        <div className="actions text-right">
          <button
            className="btn btn-xs btn-link"
            onClick={() => {
              this.deleteScheduledAction(action);
            }}
          >
            <span className="glyphicon glyphicon-trash" uib-tooltip="Delete Scheduled Action" />
            <span className="sr-only">Delete Scheduled Action</span>
          </button>
        </div>
      </div>
    );
  }
}
