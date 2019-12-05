import {
  AccountService,
  Application,
  IHealth,
  IInstance,
  IServerGroup,
  IVpc,
  NameUtils,
  SETTINGS,
} from '@spinnaker/core';
import { TencentProviderSettings } from 'tencent/tencent.settings';
import {
  ICLBListenerCertificate,
  ITencentApplicationLoadBalancer,
  ITencentApplicationLoadBalancerUpsertCommand,
  ITencentClassicLoadBalancer,
  ITencentClassicLoadBalancerUpsertCommand,
  ITencentLoadBalancer,
  ITencentServerGroup,
  ICloudLoadBalancerSourceData,
  IClassicListenerDescription,
  IClassicLoadBalancerSourceData,
  INetworkLoadBalancerSourceData,
  ITencentNetworkLoadBalancerUpsertCommand,
  ITargetGroup,
} from 'tencent/domain';
import { VpcReader } from 'tencent/vpc/VpcReader';
import { IPromise, module } from 'angular';
import { chain, filter, flatten, map } from 'lodash';

import { $q } from 'ngimport';

export class TencentLoadBalancerTransformer {
  private updateHealthCounts(container: IServerGroup | ITargetGroup | ITencentLoadBalancer): void {
    const instances = container.instances;

    container.instanceCounts = {
      up: instances.filter(instance => instance.health[0].state === 'InService').length,
      down: instances.filter(instance => instance.healthState === 'Down').length,
      outOfService: instances.filter(instance => instance.healthState === 'OutOfService').length,
      starting: undefined,
      succeeded: undefined,
      failed: undefined,
      unknown: undefined,
    };

    if ((container as ITargetGroup | ITencentLoadBalancer).serverGroups) {
      const serverGroupInstances = flatten(
        (container as ITargetGroup).serverGroups.filter(sg => !!sg.instances).map(sg => sg.instances),
      );
      container.instanceCounts.up = serverGroupInstances.filter(
        instance => instance.health[0].state === 'InService',
      ).length;
      container.instanceCounts.down = serverGroupInstances.filter(instance => instance.healthState === 'Down').length;
      container.instanceCounts.outOfService = serverGroupInstances.filter(
        instance => instance.healthState === 'OutOfService',
      ).length;
    }
  }

  private transformInstance(instance: IInstance, provider: string, account: string, region: string): void {
    // instance in this case should be some form if instance source data, but force to 'any' type to fix
    // instnace health in load balancers until we can actually shape this bit properly
    const health: IHealth = (instance.health as any) || ({} as IHealth);
    if (health.state === 'healthy') {
      // Target groups use 'healthy' instead of 'InService' and a lot of deck expects InService
      // to surface health in the UI; just set it as InService since we don't really care the
      // specific state name... yet
      health.state = 'InService';
    }
    instance.provider = provider;
    instance.account = account;
    instance.region = region;
    instance.healthState = health.state ? (health.state === 'InService' ? 'Up' : 'Down') : 'OutOfService';
    instance.health = [health];
  }

  private addVpcNameToContainer(
    container: ITencentLoadBalancer | ITargetGroup,
  ): (vpcs: IVpc[]) => ITencentLoadBalancer | ITargetGroup {
    return (vpcs: IVpc[]) => {
      const match = vpcs.find(test => test.id === container.vpcId);
      container.vpcName = match ? match.name : '';
      return container;
    };
  }

  private normalizeServerGroups(
    serverGroups: IServerGroup[],
    container: ITencentLoadBalancer | ITargetGroup,
    containerType: string,
    healthType: string,
  ): void {
    serverGroups.forEach(serverGroup => {
      serverGroup.account = serverGroup.account || container.account;
      serverGroup.region = serverGroup.region || container.region;
      serverGroup.cloudProvider = serverGroup.cloudProvider || container.cloudProvider;

      if (serverGroup.detachedInstances) {
        serverGroup.detachedInstances = (serverGroup.detachedInstances as any).map((instanceId: string) => {
          return { id: instanceId } as IInstance;
        });
        serverGroup.instances = serverGroup.instances.concat(serverGroup.detachedInstances);
      } else {
        serverGroup.detachedInstances = [];
      }
      if (serverGroup.instances) {
        serverGroup.instances.forEach(instance => {
          this.transformInstance(instance, container.type, container.account, container.region);
          (instance as any)[containerType] = [container.name];
          (instance.health as any).type = healthType;
        });
        this.updateHealthCounts(serverGroup);
      }
    });
  }

  private normalizeTargetGroup(targetGroup: ITargetGroup): IPromise<ITargetGroup> {
    this.normalizeServerGroups(targetGroup.serverGroups, targetGroup, 'targetGroups', 'TargetGroup');

    const activeServerGroups = filter(targetGroup.serverGroups, { isDisabled: false });
    targetGroup.provider = targetGroup.type;
    targetGroup.instances = chain(activeServerGroups)
      .map('instances')
      .flatten<IInstance>()
      .value();
    targetGroup.detachedInstances = chain(activeServerGroups)
      .map('detachedInstances')
      .flatten<IInstance>()
      .value();
    this.updateHealthCounts(targetGroup);

    return $q.all([VpcReader.listVpcs(), AccountService.listAllAccounts()]).then(([vpcs, accounts]) => {
      const tg = this.addVpcNameToContainer(targetGroup)(vpcs) as ITargetGroup;

      tg.serverGroups = tg.serverGroups.map(serverGroup => {
        const account = accounts.find(x => x.name === serverGroup.account);
        const cloudProvider = (account && account.cloudProvider) || serverGroup.cloudProvider;

        serverGroup.cloudProvider = cloudProvider;
        serverGroup.instances.forEach(instance => {
          instance.cloudProvider = cloudProvider;
          instance.provider = cloudProvider;
        });

        return { ...serverGroup, cloudProvider };
      });

      return tg;
    });
  }

  public normalizeLoadBalancer(loadBalancer: ITencentLoadBalancer): IPromise<ITencentLoadBalancer> {
    this.normalizeServerGroups(loadBalancer.serverGroups, loadBalancer, 'loadBalancers', 'LoadBalancer');

    let serverGroups = loadBalancer.serverGroups;
    if ((loadBalancer as ITencentApplicationLoadBalancer).targetGroups) {
      const appLoadBalancer = loadBalancer as ITencentApplicationLoadBalancer;
      appLoadBalancer.targetGroups.forEach(targetGroup => this.normalizeTargetGroup(targetGroup));
      serverGroups = flatten<ITencentServerGroup>(map(appLoadBalancer.targetGroups, 'serverGroups'));
    }

    loadBalancer.loadBalancerType = loadBalancer.loadBalancerType || 'classic';
    loadBalancer.provider = loadBalancer.type;

    const activeServerGroups = filter(serverGroups, { isDisabled: false });
    loadBalancer.instances = chain(activeServerGroups)
      .map('instances')
      .flatten<IInstance>()
      .value();
    loadBalancer.detachedInstances = chain(activeServerGroups)
      .map('detachedInstances')
      .flatten<IInstance>()
      .value();
    this.updateHealthCounts(loadBalancer);
    return VpcReader.listVpcs().then(
      (vpcs: IVpc[]) => this.addVpcNameToContainer(loadBalancer)(vpcs) as ITencentLoadBalancer,
    );
  }

  public convertClassicLoadBalancerForEditing(
    loadBalancer: ITencentClassicLoadBalancer,
  ): ITencentClassicLoadBalancerUpsertCommand {
    const toEdit: ITencentClassicLoadBalancerUpsertCommand = {
      availabilityZones: undefined,
      isInternal: loadBalancer.isInternal,
      region: loadBalancer.region,
      cloudProvider: loadBalancer.cloudProvider,
      credentials: loadBalancer.credentials || loadBalancer.account,
      listeners: loadBalancer.listeners,
      loadBalancerType: 'classic',
      name: loadBalancer.name,
      regionZones: loadBalancer.availabilityZones,
      securityGroups: loadBalancer.securityGroups,
      vpcId: loadBalancer.vpcId,
      healthCheck: undefined,
      healthTimeout: loadBalancer.healthTimeout,
      healthInterval: loadBalancer.healthInterval,
      healthyThreshold: loadBalancer.healthyThreshold,
      unhealthyThreshold: loadBalancer.unhealthyThreshold,
      healthCheckProtocol: loadBalancer.healthCheckProtocol,
      healthCheckPort: loadBalancer.healthCheckPort,
      healthCheckPath: loadBalancer.healthCheckPath,
      idleTimeout: loadBalancer.idleTimeout || 60,
      subnetType: loadBalancer.subnetType,
    };

    if (loadBalancer.elb) {
      const elb = loadBalancer.elb as IClassicLoadBalancerSourceData;
      toEdit.securityGroups = elb.securityGroups;
      toEdit.vpcId = elb.vpcid || elb.vpcId;

      if (elb.listenerDescriptions) {
        toEdit.listeners = elb.listenerDescriptions.map(
          (description: any): IClassicListenerDescription => {
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
              sslCertificateType: listener.sslCertificateType,
            };
          },
        );
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

  public convertApplicationLoadBalancerForEditing(
    loadBalancer: ITencentApplicationLoadBalancer,
  ): ITencentApplicationLoadBalancerUpsertCommand {
    // Since we build up toEdit as we go, much easier to declare as any, then cast at return time.
    const toEdit: ITencentApplicationLoadBalancerUpsertCommand = {
      availabilityZones: undefined,
      isInternal: loadBalancer.isInternal || loadBalancer.loadBalancerType === 'INTERNAL',
      region: loadBalancer.region,
      loadBalancerId: loadBalancer.loadBalancerId,
      loadBalancerType: 'application',
      cloudProvider: loadBalancer.cloudProvider,
      credentials: loadBalancer.account || loadBalancer.credentials,
      listeners: loadBalancer.listeners,
      targetGroups: [],
      name: loadBalancer.name,
      regionZones: loadBalancer.availabilityZones,
      securityGroups: loadBalancer.securityGroups || [],
      subnetType: loadBalancer.subnetId,
      subnetId: loadBalancer.subnetId,
      vpcId: loadBalancer.vpcId,
      idleTimeout: loadBalancer.idleTimeout || 60,
      deletionProtection: loadBalancer.deletionProtection || false,
    };
    return toEdit;
  }

  public convertNetworkLoadBalancerForEditing(
    loadBalancer: ITencentApplicationLoadBalancer,
  ): ITencentNetworkLoadBalancerUpsertCommand {
    const applicationName = NameUtils.parseLoadBalancerName(loadBalancer.name).application;

    // Since we build up toEdit as we go, much easier to declare as any, then cast at return time.
    const toEdit: ITencentNetworkLoadBalancerUpsertCommand = {
      availabilityZones: undefined,
      isInternal: loadBalancer.isInternal,
      region: loadBalancer.region,
      loadBalancerType: 'network',
      cloudProvider: loadBalancer.cloudProvider,
      credentials: loadBalancer.account || loadBalancer.credentials,
      listeners: [],
      targetGroups: [],
      name: loadBalancer.name,
      regionZones: loadBalancer.availabilityZones,
      securityGroups: [],
      subnetType: loadBalancer.subnetType,
      vpcId: undefined,
      deletionProtection: loadBalancer.deletionProtection,
    };

    if (loadBalancer.elb) {
      const elb = loadBalancer.elb as INetworkLoadBalancerSourceData;
      toEdit.securityGroups = elb.securityGroups;
      toEdit.vpcId = elb.vpcid || elb.vpcId;

      // Convert listeners
      if (elb.listeners) {
        toEdit.listeners = elb.listeners.map(listener => {
          const certificates: ICLBListenerCertificate[] = [];
          if (listener.certificates) {
            listener.certificates.forEach(cert => {
              certificates.push({
                sslMode: cert.sslMode,
                certCaId: cert.certCaId,
                certId: cert.certId,
              });
            });
          }

          (listener.defaultActions || []).forEach(action => {
            if (action.targetGroupName) {
              action.targetGroupName = action.targetGroupName.replace(`${applicationName}-`, '');
            }
          });

          // Remove the default rule because it already exists in defaultActions
          listener.rules = (listener.rules || []).filter(l => !l.default);
          listener.rules.forEach(rule => {
            (rule.actions || []).forEach((action: any) => {
              if (action.targetGroupName) {
                action.targetGroupName = action.targetGroupName.replace(`${applicationName}-`, '');
              }
            });
            rule.conditions = rule.conditions || [];
          });

          // Sort listener.rules by priority.
          listener.rules.sort((a, b) => (a.priority as number) - (b.priority as number));

          return {
            protocol: listener.protocol,
            port: listener.port,
            certificates,
            rules: listener.rules || [],
            sslPolicy: listener.sslPolicy,
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
            targetType: targetGroup.targetType,
            healthCheckProtocol: targetGroup.healthCheckProtocol,
            healthCheckPort: targetGroup.healthCheckPort,
            healthCheckTimeout: targetGroup.healthCheckTimeoutSeconds,
            healthCheckInterval: targetGroup.healthCheckIntervalSeconds,
            healthyThreshold: targetGroup.healthyThresholdCount,
            unhealthyThreshold: targetGroup.unhealthyThresholdCount,
            healthCheckPath: targetGroup.healthCheckPath,
            attributes: {
              deregistrationDelay: Number(targetGroup.attributes['deregistration_delay.timeout_seconds']),
            },
          };
        });
      }
    }
    return toEdit;
  }

  public constructNewClassicLoadBalancerTemplate(application: Application): ITencentClassicLoadBalancerUpsertCommand {
    const defaultCredentials = application.defaultCredentials.tencent || TencentProviderSettings.defaults.account,
      defaultRegion = application.defaultRegions.tencent || TencentProviderSettings.defaults.region,
      defaultSubnetType = TencentProviderSettings.defaults.subnetType;
    return {
      application: application.name,
      availabilityZones: undefined,
      name: '',
      stack: '',
      detail: '',
      loadBalancerType: 'classic',
      isInternal: false,
      cloudProvider: 'tencent',
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
      idleTimeout: 60,
      regionZones: [],
      securityGroups: [],
      listeners: [
        {
          externalPort: 80,
          externalProtocol: 'HTTP',
          internalPort: 7001,
          internalProtocol: 'HTTP',
        },
      ],
    };
  }

  public constructNewApplicationLoadBalancerTemplate(
    application: Application,
  ): ITencentApplicationLoadBalancerUpsertCommand {
    const defaultCredentials = application.defaultCredentials.tencent || TencentProviderSettings.defaults.account,
      defaultRegion = application.defaultRegions.tencent || TencentProviderSettings.defaults.region,
      defaultSubnetType = TencentProviderSettings.defaults.subnetType,
      defaultPort = application.attributes.instancePort || SETTINGS.defaultInstancePort,
      defaultTargetGroupName = `targetgroup`;
    return {
      application: application.name,
      name: '',
      availabilityZones: undefined,
      stack: '',
      detail: '',
      loadBalancerType: 'application',
      isInternal: false,
      cloudProvider: 'tencent',
      credentials: defaultCredentials,
      region: defaultRegion,
      vpcId: null,
      subnetId: defaultSubnetType,
      subnetType: defaultSubnetType,
      idleTimeout: 60,
      deletionProtection: false,
      targetGroups: [
        {
          name: defaultTargetGroupName,
          protocol: 'HTTP',
          port: defaultPort,
          targetType: 'instance',
          healthCheckProtocol: 'HTTP',
          healthCheckPort: 'traffic-port',
          healthCheckPath: '/healthcheck',
          healthCheckTimeout: 5,
          healthCheckInterval: 10,
          healthyThreshold: 10,
          unhealthyThreshold: 2,
          attributes: {
            deregistrationDelay: 600,
            stickinessEnabled: false,
            stickinessType: 'lb_cookie',
            stickinessDuration: 8400,
          },
        },
      ],
      regionZones: [],
      securityGroups: [],
      listeners: [
        {
          protocol: 'HTTP',
          port: 80,
          rules: [],
          isNew: true,
          healthCheck: {
            healthSwitch: 1,
            timeOut: 2,
            intervalTime: 5,
            healthNum: 3,
            unHealthNum: 3,
            showAdvancedSetting: false,
          },
        },
      ],
    };
  }

  public constructNewNetworkLoadBalancerTemplate(application: Application): ITencentNetworkLoadBalancerUpsertCommand {
    const defaultCredentials = application.defaultCredentials.tencent || TencentProviderSettings.defaults.account,
      defaultRegion = application.defaultRegions.tencent || TencentProviderSettings.defaults.region,
      defaultSubnetType = TencentProviderSettings.defaults.subnetType,
      defaultTargetGroupName = `targetgroup`;
    return {
      application: application.name,
      name: '',
      availabilityZones: undefined,
      stack: '',
      detail: '',
      loadBalancerType: 'network',
      isInternal: false,
      cloudProvider: 'tencent',
      credentials: defaultCredentials,
      region: defaultRegion,
      vpcId: null,
      subnetType: defaultSubnetType,
      deletionProtection: false,
      securityGroups: [],
      targetGroups: [
        {
          name: defaultTargetGroupName,
          protocol: 'TCP',
          port: 7001,
          targetType: 'instance',
          healthCheckProtocol: 'TCP',
          healthCheckPath: '/healthcheck',
          healthCheckPort: 'traffic-port',
          healthCheckTimeout: 5,
          healthCheckInterval: 10,
          healthyThreshold: 10,
          unhealthyThreshold: 10,
          attributes: {
            deregistrationDelay: 600,
          },
        },
      ],
      regionZones: [],
      listeners: [
        {
          protocol: 'TCP',
          port: 80,
          rules: [],
          healthCheck: {
            healthSwitch: 1,
            timeOut: 2,
            intervalTime: 5,
            healthNum: 3,
            unHealthNum: 3,
            showAdvancedSetting: false,
            httpCode: 31,
            httpCheckPath: '/',
            httpCheckDomain: '',
            httpCheckMethod: 'GET',
          },
        },
      ],
    };
  }
}

export const TENCENT_LOAD_BALANCER_TRANSFORMER = 'spinnaker.tencent.loadBalancer.transformer';
module(TENCENT_LOAD_BALANCER_TRANSFORMER, []).service('tencentLoadBalancerTransformer', TencentLoadBalancerTransformer);
