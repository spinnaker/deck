import { IPromise, module } from 'angular';
import { chain, filter, flatten, map } from 'lodash';

import {
  Application,
  IHealth,
  IServerGroup,
  IInstance,
  IVpc,
  NAMING_SERVICE,
  NamingService
} from '@spinnaker/core';

import { AWSProviderSettings } from 'amazon/aws.settings';
import {
  IAmazonApplicationLoadBalancer,
  IALBListenerCertificate,
  IAmazonClassicLoadBalancer,
  IAmazonLoadBalancer,
  IApplicationLoadBalancerSourceData,
  IClassicListenerDescription,
  IClassicLoadBalancerSourceData,
  IAmazonApplicationLoadBalancerUpsertCommand,
  IAmazonClassicLoadBalancerUpsertCommand,
  ITargetGroup
} from 'amazon/domain';
import { VPC_READ_SERVICE, VpcReader } from 'amazon/vpc/vpc.read.service';

export class AwsLoadBalancerTransformer {
  public constructor(private vpcReader: VpcReader, private namingService: NamingService) { 'ngInject'; }

  private updateHealthCounts(serverGroup: IServerGroup | ITargetGroup | IAmazonLoadBalancer): void {
    const instances = serverGroup.instances;
    let serverGroups: IServerGroup[]  = [serverGroup] as IServerGroup[];
    if ((serverGroup as ITargetGroup | IAmazonLoadBalancer).serverGroups) {
      const container = serverGroup as ITargetGroup;
      serverGroups = container.serverGroups;
    }
    serverGroup.instanceCounts = {
      up: instances.filter((instance) => instance.health[0].state === 'InService').length,
      down: instances.filter((instance) => instance.health[0].state === 'OutOfService').length,
      outOfService: serverGroups.reduce((acc, sg): number => {
        return sg.instances.filter((instance): boolean => {
          return instance.healthState === 'OutOfService';
        }).length + acc;
      }, 0),
      starting: undefined,
      succeeded: undefined,
      failed: undefined,
      unknown: undefined,
    };
  }

  private transformInstance(instance: IInstance, provider: string, account: string, region: string): void {
    // instance in this case should be some form if instance source data, but force to 'any' type to fix
    // instnace health in load balancers until we can actually shape this bit properly
    const health: IHealth = (instance.health as any) || {} as IHealth;
    if (health.state === 'healthy') {
      // Target groups use 'healthy' instead of 'InService' and a lot of deck expects InService
      // to surface health in the UI; just set it as InService since we don't really care the
      // specific state name... yet
      health.state = 'InService';
    }
    instance.provider = provider;
    instance.account = account;
    instance.region = region;
    instance.healthState = health.state ? health.state === 'InService' ? 'Up' : 'Down' : 'OutOfService';
    instance.health = [health];
  }

  private addVpcNameToContainer(container: IAmazonLoadBalancer | ITargetGroup): (vpcs: IVpc[]) => IAmazonLoadBalancer | ITargetGroup {
    return (vpcs: IVpc[]) => {
      const match = vpcs.find((test) => test.id === container.vpcId);
      container.vpcName = match ? match.name : '';
      return container;
    };
  }

  private normalizeServerGroups(serverGroups: IServerGroup[], container: IAmazonLoadBalancer | ITargetGroup, containerType: string, healthType: string): void {
    serverGroups.forEach((serverGroup) => {
      serverGroup.account = container.account;
      serverGroup.region = container.region;
      if (serverGroup.detachedInstances) {
        serverGroup.detachedInstances = (serverGroup.detachedInstances as any).map((instanceId: string) => {
          return { id: instanceId } as IInstance;
        });
        serverGroup.instances = serverGroup.instances.concat(serverGroup.detachedInstances);
      } else {
        serverGroup.detachedInstances = [];
      }

      serverGroup.instances.forEach((instance) => {
        this.transformInstance(instance, container.type, container.account, container.region);
        (instance as any)[containerType] = [container.name];
        (instance.health as any).type = healthType;
      });
      this.updateHealthCounts(serverGroup);
    });
  }

  private normalizeTargetGroup(targetGroup: ITargetGroup): IPromise<ITargetGroup> {
    this.normalizeServerGroups(targetGroup.serverGroups, targetGroup, 'targetGroups', 'TargetGroup');

    const activeServerGroups = filter(targetGroup.serverGroups, {isDisabled: false});
    targetGroup.provider = targetGroup.type;
    targetGroup.instances = chain(activeServerGroups).map('instances').flatten<IInstance>().value();
    targetGroup.detachedInstances = chain(activeServerGroups).map('detachedInstances').flatten<IInstance>().value();
    this.updateHealthCounts(targetGroup);

    return this.vpcReader.listVpcs().then((vpcs: IVpc[]) => this.addVpcNameToContainer(targetGroup)(vpcs) as ITargetGroup);
  }

  public normalizeLoadBalancer(loadBalancer: IAmazonLoadBalancer): IPromise<IAmazonLoadBalancer> {
    this.normalizeServerGroups(loadBalancer.serverGroups, loadBalancer, 'loadBalancers', 'LoadBalancer');

    let serverGroups = loadBalancer.serverGroups;
    if ((loadBalancer as IAmazonApplicationLoadBalancer).targetGroups) {
      const appLoadBalancer = loadBalancer as IAmazonApplicationLoadBalancer;
      appLoadBalancer.targetGroups.forEach((targetGroup) => this.normalizeTargetGroup(targetGroup));
      serverGroups = flatten<IServerGroup>(map(appLoadBalancer.targetGroups, 'serverGroups'));
    }

    const activeServerGroups = filter(serverGroups, {isDisabled: false});
    loadBalancer.provider = loadBalancer.type;
    loadBalancer.instances = chain(activeServerGroups).map('instances').flatten<IInstance>().value();
    loadBalancer.detachedInstances = chain(activeServerGroups).map('detachedInstances').flatten<IInstance>().value();
    this.updateHealthCounts(loadBalancer);
    return this.vpcReader.listVpcs().then((vpcs: IVpc[]) => this.addVpcNameToContainer(loadBalancer)(vpcs) as IAmazonLoadBalancer);
  }

  public convertClassicLoadBalancerForEditing(loadBalancer: IAmazonClassicLoadBalancer): IAmazonClassicLoadBalancerUpsertCommand {
    const toEdit: IAmazonClassicLoadBalancerUpsertCommand = {
      availabilityZones: undefined,
      isInternal: loadBalancer.isInternal,
      region: loadBalancer.region,
      cloudProvider: loadBalancer.cloudProvider,
      credentials: loadBalancer.account,
      listeners: [],
      loadBalancerType: 'classic',
      name: loadBalancer.name,
      regionZones: loadBalancer.availabilityZones,
      securityGroups: [],
      vpcId: undefined,
      healthCheck: undefined,
      healthTimeout: undefined,
      healthInterval: undefined,
      healthyThreshold: undefined,
      unhealthyThreshold: undefined,
      healthCheckProtocol: undefined,
      healthCheckPort: undefined,
      healthCheckPath: undefined,
      subnetType: loadBalancer.subnetType,
    };

    if (loadBalancer.elb) {
      const elb = loadBalancer.elb as IClassicLoadBalancerSourceData;
      toEdit.securityGroups = elb.securityGroups;
      toEdit.vpcId = elb.vpcid || elb.vpcId;

      if (elb.listenerDescriptions) {
        toEdit.listeners = elb.listenerDescriptions.map((description: any): IClassicListenerDescription => {
          const listener = description.listener;
          if (listener.sslcertificateId) {
            const splitCertificateId = listener.sslcertificateId.split('/');
            listener.sslcertificateId = splitCertificateId[1];
            listener.sslCertificateType = splitCertificateId[0].split(':')[2];
          }
          return {
            internalProtocol: listener.instanceProtocol,
            internalPort: listener.instancePort,
            externalProtocol: listener.protocol,
            externalPort: listener.loadBalancerPort,
            sslCertificateId: listener.sslcertificateId,
            sslCertificateName: listener.sslcertificateId,
            sslCertificateType: listener.sslCertificateType
          };
        });
      }

      if (elb.healthCheck && elb.healthCheck.target) {
        toEdit.healthTimeout = elb.healthCheck.timeout;
        toEdit.healthInterval = elb.healthCheck.interval;
        toEdit.healthyThreshold = elb.healthCheck.healthyThreshold;
        toEdit.unhealthyThreshold = elb.healthCheck.unhealthyThreshold;

        const healthCheck = elb.healthCheck.target;
        const protocolIndex = healthCheck.indexOf(':');
        let pathIndex = healthCheck.indexOf('/');

        if (pathIndex === -1) {
          pathIndex = healthCheck.length;
        }

        if (protocolIndex !== -1) {
          toEdit.healthCheckProtocol = healthCheck.substring(0, protocolIndex);
          const healthCheckPort = Number(healthCheck.substring(protocolIndex + 1, pathIndex));
          toEdit.healthCheckPath = healthCheck.substring(pathIndex);
          if (!isNaN(healthCheckPort)) {
            toEdit.healthCheckPort = healthCheckPort;
          }
        }
      }
    }
    return toEdit;
  }

  public convertApplicationLoadBalancerForEditing(loadBalancer: IAmazonApplicationLoadBalancer): IAmazonApplicationLoadBalancerUpsertCommand {
    const applicationName = this.namingService.parseLoadBalancerName(loadBalancer.name).application;

    // Since we build up toEdit as we go, much easier to declare as any, then cast at return time.
    const toEdit: IAmazonApplicationLoadBalancerUpsertCommand = {
      availabilityZones: undefined,
      isInternal: loadBalancer.isInternal,
      region: loadBalancer.region,
      loadBalancerType: 'application',
      cloudProvider: loadBalancer.cloudProvider,
      credentials: loadBalancer.account,
      listeners: [],
      targetGroups: [],
      name: loadBalancer.name,
      regionZones: loadBalancer.availabilityZones,
      securityGroups: [],
      subnetType: loadBalancer.subnetType,
      vpcId: undefined,
    };

    if (loadBalancer.elb) {
      const elb = loadBalancer.elb as IApplicationLoadBalancerSourceData;
      toEdit.securityGroups = elb.securityGroups;
      toEdit.vpcId = elb.vpcid || elb.vpcId;

      // Convert listeners
      if (elb.listeners) {
        toEdit.listeners = elb.listeners.map((listener) => {
          const certificates: IALBListenerCertificate[] = [];
          if (listener.certificates) {
            listener.certificates.forEach((cert) => {
              const certArnParts = cert.certificateArn.split(':');
              const certParts = certArnParts[5].split('/');
              certificates.push({
                certificateArn: cert.certificateArn,
                type: certArnParts[2],
                name: certParts[1]
              });
            });
          }

          (listener.defaultActions || []).forEach((action) => {
            action.targetGroupName = action.targetGroupName.replace(`${applicationName}-`, '');
          });

          // Remove the default rule because it already exists in defaultActions
          listener.rules = (listener.rules || []).filter((l) => !l.default);
          listener.rules.forEach((rule) => {
            (rule.actions || []).forEach((action) => {
              action.targetGroupName = action.targetGroupName.replace(`${applicationName}-`, '');
            });
            rule.conditions = rule.conditions || [];
          });

          // Sort listener.rules by priority.
          listener.rules.sort((a, b) => (a.priority as number) - (b.priority as number));

          return {
            protocol: listener.protocol,
            port: listener.port,
            defaultActions: listener.defaultActions,
            certificates: certificates,
            rules: listener.rules || [],
            sslPolicy: listener.sslPolicy
          };
        });
      }

      // Convert target groups
      if (elb.targetGroups) {
        toEdit.targetGroups = elb.targetGroups.map((targetGroup: any) => {
          return {
            name: targetGroup.targetGroupName.replace(`${applicationName}-`, ''),
            protocol: targetGroup.protocol,
            port: targetGroup.port,
            healthCheckProtocol: targetGroup.healthCheckProtocol,
            healthCheckPort: targetGroup.healthCheckPort,
            healthCheckPath: targetGroup.healthCheckPath,
            healthCheckTimeout: targetGroup.healthCheckTimeoutSeconds,
            healthCheckInterval: targetGroup.healthCheckIntervalSeconds,
            healthyThreshold: targetGroup.healthyThresholdCount,
            unhealthyThreshold: targetGroup.unhealthyThresholdCount,
            attributes: {
              deregistrationDelay: Number(targetGroup.attributes['deregistration_delay.timeout_seconds']),
              stickinessEnabled: targetGroup.attributes['stickiness.enabled'] === 'true',
              stickinessType: targetGroup.attributes['stickiness.type'],
              stickinessDuration: Number(targetGroup.attributes['stickiness.lb_cookie.duration_seconds']),
            }
          };
        });
      }
    }
    return toEdit;
  }

  public constructNewClassicLoadBalancerTemplate(application: Application): IAmazonClassicLoadBalancerUpsertCommand {
    const defaultCredentials = application.defaultCredentials.aws || AWSProviderSettings.defaults.account,
        defaultRegion = application.defaultRegions.aws || AWSProviderSettings.defaults.region,
        defaultSubnetType = AWSProviderSettings.defaults.subnetType;
    return {
      availabilityZones: undefined,
      name: undefined,
      stack: '',
      detail: '',
      loadBalancerType: 'classic',
      isInternal: false,
      cloudProvider: 'aws',
      credentials: defaultCredentials,
      region: defaultRegion,
      vpcId: null,
      subnetType: defaultSubnetType,
      healthCheck: undefined,
      healthCheckProtocol: 'HTTP',
      healthCheckPort: 7001,
      healthCheckPath: '/healthcheck',
      healthTimeout: 5,
      healthInterval: 10,
      healthyThreshold: 10,
      unhealthyThreshold: 2,
      regionZones: [],
      securityGroups: [],
      listeners: [
        {
          externalPort: 80,
          externalProtocol: 'HTTP',
          internalPort: 7001,
          internalProtocol: 'HTTP'
        }
      ]
    };
  }

  public constructNewApplicationLoadBalancerTemplate(application: Application): IAmazonApplicationLoadBalancerUpsertCommand {
    const defaultCredentials = application.defaultCredentials.aws || AWSProviderSettings.defaults.account,
        defaultRegion = application.defaultRegions.aws || AWSProviderSettings.defaults.region,
        defaultSubnetType = AWSProviderSettings.defaults.subnetType,
        defaultTargetGroupName = `targetgroup`;
    return {
      name: undefined,
      availabilityZones: undefined,
      stack: '',
      detail: '',
      loadBalancerType: 'application',
      isInternal: false,
      cloudProvider: 'aws',
      credentials: defaultCredentials,
      region: defaultRegion,
      vpcId: null,
      subnetType: defaultSubnetType,
      targetGroups: [
        {
          name: defaultTargetGroupName,
          protocol: 'HTTP',
          port: 7001,
          healthCheckProtocol: 'HTTP',
          healthCheckPort: '7001',
          healthCheckPath: '/healthcheck',
          healthCheckTimeout: 5,
          healthCheckInterval: 10,
          healthyThreshold: 10,
          unhealthyThreshold: 2,
          attributes: {
            deregistrationDelay: 600,
            stickinessEnabled: false,
            stickinessType: 'lb_cookie',
            stickinessDuration: 8400
          }
        }
      ],
      regionZones: [],
      securityGroups: [],
      listeners: [
        {
          certificates: [],
          protocol: 'HTTP',
          port: 80,
          defaultActions: [
            {
              type: 'forward',
              targetGroupName: defaultTargetGroupName
            }
          ],
          rules: [],
        }
      ]
    };
  }
}

export const AWS_LOAD_BALANCER_TRANSFORMER = 'spinnaker.amazon.loadBalancer.transformer';
module(AWS_LOAD_BALANCER_TRANSFORMER, [
  VPC_READ_SERVICE,
  NAMING_SERVICE
])
  .service('awsLoadBalancerTransformer', AwsLoadBalancerTransformer);
