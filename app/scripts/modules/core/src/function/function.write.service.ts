import { IPromise } from 'angular';

import { Application } from 'core/application/application.model';
import { ITask } from 'core/domain';
import { IJob, TaskExecutor } from 'core/task/taskExecutor';
import { IMoniker } from 'core/naming/IMoniker';

export interface IFunctionUpsertCommand extends IJob {
  functionName: string;
  cloudProvider: string;
  credentials: string;
  description?: string;
  region: string;
  operation: string;
}

export interface IFunctionDeleteCommand extends IJob {
  cloudProvider: string;
  functionName: string;
  credentials: string;
  regions: string;
  vpcId?: string;
  operation: string;
}

export class FunctionWriter {
  public static deleteFunction(command: IFunctionDeleteCommand, application: Application): ng.IPromise<ITask> {
    command.type = 'lambdaFunction';
    command.operation = 'deleteLambdaFunction';
    return TaskExecutor.executeTask({
      job: [command],
      application,
      description: `Delete Function: ${command.functionName}`,
    });
  }

  public static upsertFunction(
    command: IFunctionUpsertCommand,
    application: Application,
    descriptor: string,
    params: any = {},
  ): IPromise<ITask> {
    Object.assign(command, params);
    command.type = 'lambdaFunction';
    if (descriptor.includes('Update')) {
      command.operation = 'updateLambdaFunctionConfiguration';
    } else {
      command.operation = 'createLambdaFunction';
    }

    return TaskExecutor.executeTask({
      job: [command],
      application,
      description: `${descriptor} Function: ${command['functionName']}`,
    });
  }
}
