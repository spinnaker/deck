
import { TaskExecutor } from 'core/task/taskExecutor';
import { $q } from 'ngimport';
import { isString } from 'lodash';

import { AccountService } from 'core/account/AccountService';
import { CloudProviderRegistry } from 'core/cloudProvider';

import { Application } from 'core/application';
import { IAccountDetails } from 'core/account';
import { IJob } from 'core/task';
import { ITask } from 'core/domain';

export class SnapshotWriter {
  private static buildSaveSnapshotJobs(app: Application, accountDetails: IAccountDetails[]): IJob[] {
    const jobs: IJob[] = [];
    accountDetails.forEach((accountDetail) => {
      if (CloudProviderRegistry.getValue(accountDetail.cloudProvider, 'snapshotsEnabled')) {
        jobs.push({
          type: 'saveSnapshot',
          credentials: accountDetail.name,
          applicationName: app.name,
          cloudProvider: accountDetail.cloudProvider,
        });
      }
    });
    return jobs;
  }

  private static buildRestoreSnapshotJob(app: Application, accountDetail: IAccountDetails, timestamp: number) {
    const jobs: IJob[] = [];
    if (CloudProviderRegistry.getValue(accountDetail.cloudProvider, 'snapshotsEnabled')) {
      jobs.push({
        type: 'restoreSnapshot',
        credentials: accountDetail.name,
        applicationName: app.name,
        snapshotTimestamp: timestamp,
        cloudProvider: accountDetail.cloudProvider,
      });
    }
    return jobs;
  }

  private static loadAccountDetails(app: Application): PromiseLike<IAccountDetails[]> {
    const accounts = isString(app.accounts) ? app.accounts.split(',') : [];
    const accountDetailPromises = accounts.map((account) => AccountService.getAccountDetails(account));
    return $q.all(accountDetailPromises);
  }

  public static takeSnapshot(app: Application): PromiseLike<ITask> {
    return this.loadAccountDetails(app).then((accountDetails) => {
      const jobs = this.buildSaveSnapshotJobs(app, accountDetails);
      return TaskExecutor.executeTask({
        job: jobs,
        application: app,
        description: 'Take Snapshot of ' + app.name,
      });
    });
  }

  public static restoreSnapshot(app: Application, account: string, timestamp: number): PromiseLike<ITask> {
    return AccountService.getAccountDetails(account).then((accountDetail) => {
      const jobs = this.buildRestoreSnapshotJob(app, accountDetail, timestamp);
      return TaskExecutor.executeTask({
        job: jobs,
        application: app,
        description: `Restore Snapshot ${timestamp} of application: ${app.name} for account: ${accountDetail.name}`,
      });
    });
  }
}
