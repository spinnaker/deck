import { module } from 'angular';

import { TASK_EXECUTOR, TaskExecutor, IJob } from 'core/task/taskExecutor';
import { SERVER_GROUP_READER, ServerGroupReader } from 'core/serverGroup/serverGroupReader.service';
import { Application } from 'core/application/application.model';
import { PROVIDER_SERVICE_DELEGATE, ProviderServiceDelegate } from 'core/cloudProvider/providerService.delegate';
import { IInstance, IServerGroup, ITask } from 'core/domain';

export interface IMultiInstanceGroup {
  account: string;
  cloudProvider: string;
  region: string;
  serverGroup: string;
  instanceIds: string[];
  loadBalancers: string[];
  instances: IInstance[];
}

export interface IMultiInstanceJob {
  type: string;
  cloudProvider: string;
  instanceIds: string[];
  credentials: string;
  region: string;
  serverGroupName: string;
  asgName?: string; // still needed on backend for some operations
  loadBalancerNames?: string[];
}

export class InstanceWriter {

  public constructor(protected taskExecutor: TaskExecutor,
                     protected serverGroupReader: ServerGroupReader,
                     protected providerServiceDelegate: ProviderServiceDelegate) {
    'ngInject';
  }

  public terminateInstance(instance: IInstance, application: Application, params: IJob = {}): ng.IPromise<ITask> {
    params.type = 'terminateInstances';
    params['instanceIds'] = [instance.id];
    params['region'] = instance.region;
    params['zone'] = instance.zone;
    params['credentials'] = instance.account;

    return this.taskExecutor.executeTask({
      job: [params],
      application: application,
      description: `Terminate instance: ${instance.id}`
    });
  }

  public terminateInstances(instanceGroups: IMultiInstanceGroup[], application: Application): ng.IPromise<ITask> {
    return this.executeMultiInstanceTask(instanceGroups, application, 'terminateInstances', 'Terminate');
  }

  private executeMultiInstanceTask(instanceGroups: IMultiInstanceGroup[], application: Application, type: string,
                                   baseDescriptor: string, descriptorSuffix?: string,
                                   additionalJobProperties: any = {}): ng.IPromise<ITask> {
    const jobs = this.buildMultiInstanceJob(instanceGroups, type, additionalJobProperties);
    const descriptor = this.buildMultiInstanceDescriptor(jobs, baseDescriptor, descriptorSuffix);
    return this.taskExecutor.executeTask({
      job: jobs,
      application: application,
      description: descriptor,
    });
  }

  public rebootInstances(instanceGroups: IMultiInstanceGroup[], application: Application): ng.IPromise<ITask> {
    return this.executeMultiInstanceTask(instanceGroups, application, 'rebootInstances', 'Reboot');
  }

  public rebootInstance(instance: IInstance, application: Application, params: any = {}) {
    params.type = 'rebootInstances';
    params.instanceIds = [instance.id];
    params.region = instance.region;
    params.zone = instance.zone;
    params.credentials = instance.account;
    params.cloudProvider = instance.cloudProvider;
    params.application = application.name;

    return this.taskExecutor.executeTask({
      job: [params],
      application: application,
      description: `Reboot instance: ${instance.id}`,
    });
  }

  public deregisterInstancesFromLoadBalancer(instanceGroups: IMultiInstanceGroup[], application: Application,
                                             loadBalancerNames: string[]): ng.IPromise<ITask> {
    const jobs = this.buildMultiInstanceJob(instanceGroups, 'deregisterInstancesFromLoadBalancer');
    jobs.forEach((job) => job.loadBalancerNames = loadBalancerNames);
    const descriptor = this.buildMultiInstanceDescriptor(jobs, 'Deregister', `from ${loadBalancerNames.join(' and ')}`);
    return this.taskExecutor.executeTask({
      job: jobs,
      application: application,
      description: descriptor,
    });
  }

  public deregisterInstanceFromLoadBalancer(instance: IInstance, application: Application, params: any = {}): ng.IPromise<ITask> {
    params.type = 'deregisterInstancesFromLoadBalancer';
    params.instanceIds = [instance.id];
    params.loadBalancerNames = instance.loadBalancers;
    params.region = instance.region;
    params.credentials = instance.account;
    params.cloudProvider = instance.cloudProvider;
    return this.taskExecutor.executeTask({
      job: [params],
      application: application,
      description: `Deregister instance: ${instance.id}`
    });
  }

  public registerInstancesWithLoadBalancer(instanceGroups: IMultiInstanceGroup[], application: Application, loadBalancerNames: string[]) {
    const jobs = this.buildMultiInstanceJob(instanceGroups, 'registerInstancesWithLoadBalancer');
    jobs.forEach((job) => job.loadBalancerNames = loadBalancerNames);
    const descriptor = this.buildMultiInstanceDescriptor(jobs, 'Register', `with ${loadBalancerNames.join(' and ')}`);
    return this.taskExecutor.executeTask({
      job: jobs,
      application: application,
      description: descriptor,
    });
  }

  public registerInstanceWithLoadBalancer(instance: IInstance, application: Application, params: any = {}): ng.IPromise<ITask> {
    params.type = 'registerInstancesWithLoadBalancer';
    params.instanceIds = [instance.id];
    params.loadBalancerNames = instance.loadBalancers;
    params.region = instance.region;
    params.credentials = instance.account;
    params.cloudProvider = instance.cloudProvider;
    return this.taskExecutor.executeTask({
      job: [params],
      application: application,
      description: `Register instance: ${instance.id}`
    });
  }

  public enableInstancesInDiscovery(instanceGroups: IMultiInstanceGroup[], application: Application): ng.IPromise<ITask> {
    return this.executeMultiInstanceTask(instanceGroups, application, 'enableInstancesInDiscovery', 'Enable', 'in discovery');
}

  public enableInstanceInDiscovery(instance: IInstance, application: Application): ng.IPromise<ITask> {
    return this.taskExecutor.executeTask({
      job: [
        {
          type: 'enableInstancesInDiscovery',
          instanceIds: [instance.id],
          region: instance.region,
          credentials: instance.account,
          cloudProvider: instance.cloudProvider,
          serverGroupName: instance.serverGroup,
          asgName: instance.serverGroup,
        }
      ],
      application: application,
      description: `Enable instance: ${instance.id}`
    });
  }

  public disableInstancesInDiscovery(instanceGroups: IMultiInstanceGroup[], application: Application): ng.IPromise<ITask> {
    return this.executeMultiInstanceTask(instanceGroups, application, 'disableInstancesInDiscovery', 'Disable', 'in discovery');
  }

  public disableInstanceInDiscovery(instance: IInstance, application: Application): ng.IPromise<ITask> {
    return this.taskExecutor.executeTask({
      job: [
        {
          type: 'disableInstancesInDiscovery',
          instanceIds: [instance.id],
          region: instance.region,
          credentials: instance.account,
          cloudProvider: instance.cloudProvider,
          serverGroupName: instance.serverGroup,
          asgName: instance.serverGroup,
        }
      ],
      application: application,
      description: `Disable instance: ${instance.id}`
    });
  }

  public terminateInstancesAndShrinkServerGroups(instanceGroups: IMultiInstanceGroup[], application: Application) {
    return this.executeMultiInstanceTask(instanceGroups, application, 'detachInstances', 'Terminate', 'and shrink server groups', {
      'terminateDetachedInstances': true,
      'decrementDesiredCapacity': true,
      'adjustMinIfNecessary': true,
    });
  }

  public terminateInstanceAndShrinkServerGroup(instance: IInstance, application: Application, params: any = {}) {
    return this.serverGroupReader.getServerGroup(application.name, instance.account, instance.region, instance.serverGroup).
      then((serverGroup: IServerGroup) => {
        params.type = 'terminateInstanceAndDecrementServerGroup';
        params.instance = instance.id;
        params.serverGroupName = instance.serverGroup;
        params.asgName = instance.serverGroup; // still needed on the backend
        params.region = instance.region;
        params.credentials = instance.account;
        params.cloudProvider = instance.cloudProvider;
        params.adjustMinIfNecessary = true;
        params.setMaxToNewDesired = serverGroup.asg.minSize === serverGroup.asg.maxSize;

        return this.taskExecutor.executeTask({
          job: [params],
          application: application,
          description: `Terminate instance ${instance.id} and shrink ${instance.serverGroup}`,
        });
      });
  }


  protected buildMultiInstanceJob(instanceGroups: IMultiInstanceGroup[], type: string, additionalJobProperties = {}) {
    return instanceGroups
      .filter((instanceGroup) => instanceGroup.instances.length > 0)
      .map((instanceGroup) => this.convertGroupToJob(instanceGroup, type, additionalJobProperties));
  }

  protected buildMultiInstanceDescriptor(jobs: IMultiInstanceJob[], base: string, suffix: string): string {
    let totalInstances = 0;
    jobs.forEach((job: IMultiInstanceJob) => totalInstances += job.instanceIds.length);
    let descriptor = `${base} ${totalInstances} instance`;
    if (totalInstances > 1) {
      descriptor += 's';
    }
    if (suffix) {
      descriptor += ' ' + suffix;
    }
    return descriptor;
  }

  private convertGroupToJob(instanceGroup: IMultiInstanceGroup, type: string, additionalJobProperties: any = {}): IMultiInstanceJob {
    const job: IMultiInstanceJob = {
      type: type,
      cloudProvider: instanceGroup.cloudProvider,
      instanceIds: instanceGroup.instanceIds,
      credentials: instanceGroup.account,
      region: instanceGroup.region,
      serverGroupName: instanceGroup.serverGroup,
      asgName: instanceGroup.serverGroup,
    };

    Object.assign(job, additionalJobProperties);

    this.transform(instanceGroup, job);

    return job;
  }

  private transform(instanceGroup: IMultiInstanceGroup, job: IMultiInstanceJob) {
    const hasTransformer: boolean = this.providerServiceDelegate.hasDelegate(
      instanceGroup.cloudProvider, 'instance.multiInstanceTaskTransformer');
    if (hasTransformer) {
      const transformer: any = this.providerServiceDelegate.getDelegate(
        instanceGroup.cloudProvider, 'instance.multiInstanceTaskTransformer');
      transformer.transform(instanceGroup, job);
    }
  }
}

export const INSTANCE_WRITE_SERVICE = 'spinnaker.core.instance.write.service';
module(INSTANCE_WRITE_SERVICE, [
  TASK_EXECUTOR,
  SERVER_GROUP_READER,
  PROVIDER_SERVICE_DELEGATE,
]).service('instanceWriter', InstanceWriter);
