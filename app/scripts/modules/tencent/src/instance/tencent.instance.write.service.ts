import { IPromise, module } from 'angular';

import {
  Application,
  IMultiInstanceGroup,
  IMultiInstanceJob,
  INSTANCE_WRITE_SERVICE,
  InstanceWriter,
  ITask,
  PROVIDER_SERVICE_DELEGATE,
  ProviderServiceDelegate,
  TaskExecutor,
} from '@spinnaker/core';

import { ITencentInstance } from 'tencent/domain';

export interface ITencentMultiInstanceGroup extends IMultiInstanceGroup {
  targetGroups: string[];
}

export interface ITencentMultiInstanceJob extends IMultiInstanceJob {
  targetGroupNames?: string[];
}

export class TencentInstanceWriter extends InstanceWriter {
  public static $inject = ['providerServiceDelegate'];
  public constructor(protected providerServiceDelegate: ProviderServiceDelegate) {
    super(providerServiceDelegate);
  }

  public deregisterInstancesFromTargetGroup(
    instanceGroups: IMultiInstanceGroup[],
    application: Application,
    targetGroupNames: string[],
  ): IPromise<ITask> {
    const jobs = this.buildMultiInstanceJob(
      instanceGroups,
      'deregisterInstancesFromLoadBalancer',
    ) as ITencentMultiInstanceJob[];
    jobs.forEach(job => (job.targetGroupNames = targetGroupNames));
    const descriptor = this.buildMultiInstanceDescriptor(jobs, 'Deregister', `from ${targetGroupNames.join(' and ')}`);
    return TaskExecutor.executeTask({
      job: jobs,
      application,
      description: descriptor,
    });
  }

  public deregisterInstanceFromTargetGroup(
    instance: ITencentInstance,
    application: Application,
    params: any = {},
  ): IPromise<ITask> {
    params.type = 'deregisterInstancesFromLoadBalancer';
    params.instanceIds = [instance.id];
    params.targetGroupNames = instance.targetGroups;
    params.region = instance.region;
    params.credentials = instance.account;
    params.cloudProvider = instance.cloudProvider;
    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Deregister instance: ${instance.id}`,
    });
  }

  public registerInstancesWithTargetGroup(
    instanceGroups: IMultiInstanceGroup[],
    application: Application,
    targetGroupNames: string[],
  ) {
    const jobs = this.buildMultiInstanceJob(
      instanceGroups,
      'registerInstancesWithLoadBalancer',
    ) as ITencentMultiInstanceJob[];
    jobs.forEach(job => (job.targetGroupNames = targetGroupNames));
    const descriptor = this.buildMultiInstanceDescriptor(jobs, 'Register', `with ${targetGroupNames.join(' and ')}`);
    return TaskExecutor.executeTask({
      job: jobs,
      application,
      description: descriptor,
    });
  }

  public registerInstanceWithTargetGroup(
    instance: ITencentInstance,
    application: Application,
    params: any = {},
  ): IPromise<ITask> {
    params.type = 'registerInstancesWithLoadBalancer';
    params.instanceIds = [instance.id];
    params.targetGroupNames = instance.targetGroups;
    params.region = instance.region;
    params.credentials = instance.account;
    params.cloudProvider = instance.cloudProvider;
    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Register instance: ${instance.id}`,
    });
  }
}

export const TENCENT_INSTANCE_WRITE_SERVICE = 'spinnaker.tencent.instance.write.service';
module(TENCENT_INSTANCE_WRITE_SERVICE, [INSTANCE_WRITE_SERVICE, PROVIDER_SERVICE_DELEGATE]).service(
  'tencentInstanceWriter',
  TencentInstanceWriter,
);
