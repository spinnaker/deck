import { IHttpPromiseCallbackArg } from 'angular';
import { $q } from 'ngimport';

import { ITask } from 'core/domain';

import { AuthenticationService } from '../authentication/AuthenticationService';
import { TaskReader } from './task.read.service';
import { TaskWriter } from './task.write.service';

export interface IJob {
  [attribute: string]: any;
  account?: string;
  applications?: string[];
  keys?: string[];
  providerType?: string;
  source?: any;
  type?: string;
  user?: string;
}

export interface ITaskCommand {
  application?: any;
  project?: any;
  job?: IJob[];
  description?: string;
}

export class TaskExecutor {
  public static executeTask(taskCommand: ITaskCommand): PromiseLike<ITask> {
    const owner: any = taskCommand.application || taskCommand.project || { name: 'ad-hoc' };
    if (taskCommand.application && taskCommand.application.name) {
      taskCommand.application = taskCommand.application.name;
    }
    if (taskCommand.project && taskCommand.project.name) {
      taskCommand.project = taskCommand.project.name;
    }
    if (taskCommand.job[0].providerType === 'aws') {
      delete taskCommand.job[0].providerType;
    }
    taskCommand.job.forEach((j) => (j.user = AuthenticationService.getAuthenticatedUser().name));

    return TaskWriter.postTaskCommand(taskCommand).then(
      (task: any) => {
        const taskId: string = task.ref.split('/').pop();

        if (owner.runningTasks && owner.runningTasks.refresh) {
          owner.runningTasks.refresh();
        }
        return TaskReader.getTask(taskId);
      },
      (response: IHttpPromiseCallbackArg<any>) => {
        const error: any = {
          status: response.status,
          message: response.statusText,
        };
        if (response.data && response.data.message) {
          error.log = response.data.message;
          error.failureMessage = response.data.message;
        } else {
          error.log = 'Sorry, no more information.';
          error.failureMessage = 'Sorry, no more information.';
        }
        return $q.reject(error);
      },
    );
  }
}
