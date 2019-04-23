import { module, IPromise } from 'angular';
import { $q } from 'ngimport';
import { chain, clone, cloneDeep, extend, find, has, intersection, keys, map, some, xor } from 'lodash';

import {
  AccountService,
  Application,
  CACHE_INITIALIZER_SERVICE,
  CacheInitializerService,
  IAccountDetails,
  IDeploymentStrategy,
  IRegion,
  ISecurityGroup,
  IServerGroupCommand,
  IServerGroupCommandBackingData,
  IServerGroupCommandBackingDataFiltered,
  IServerGroupCommandDirty,
  IServerGroupCommandResult,
  LOAD_BALANCER_READ_SERVICE,
  LoadBalancerReader,
  NameUtils,
  SECURITY_GROUP_READER,
  SecurityGroupReader,
  SERVER_GROUP_COMMAND_REGISTRY_PROVIDER,
  ServerGroupCommandRegistry,
  SubnetReader,
  IServerGroupCommandViewState,
} from '@spinnaker/core';

import { IKeyPair, ITencentLoadBalancerSourceData, IScalingProcess, IALBListener } from 'tencent/domain';
import { VpcReader, ITencentVpc } from 'tencent/vpc';
import { KeyPairsReader } from 'tencent/keyPairs';
import { AutoScalingProcessService } from '../details/scalingProcesses/AutoScalingProcessService';

export type IBlockDeviceMappingSource = 'source' | 'ami' | 'default';

export interface ITencentServerGroupCommandDirty extends IServerGroupCommandDirty {
  targetGroups?: string[];
}

export interface ITencentServerGroupCommandResult extends IServerGroupCommandResult {
  dirty: ITencentServerGroupCommandDirty;
}
export interface ITencentLbListenerMap {
  [key: string]: IALBListener[];
}
export interface ITencentServerGroupCommandBackingDataFiltered extends IServerGroupCommandBackingDataFiltered {
  keyPairs: IKeyPair[];
  targetGroups: string[];
  vpcList: ITencentVpc[];
  lbList: ITencentLoadBalancerSourceData[];
  listenerList: IALBListener[];
  lbListenerMap: ITencentLbListenerMap;
}

export interface ITencentServerGroupCommandBackingData extends IServerGroupCommandBackingData {
  appLoadBalancers: ITencentLoadBalancerSourceData[];
  filtered: ITencentServerGroupCommandBackingDataFiltered;
  keyPairs: IKeyPair[];
  targetGroups: string[];
  scalingProcesses: IScalingProcess[];
  diskTypes: string[];
  vpcList: ITencentVpc[];
  listenerList: IALBListener[];
}

export interface ITencentServerGroupCommandViewState extends IServerGroupCommandViewState {
  dirty: ITencentServerGroupCommandDirty;
}
export interface ITencentDisk {
  diskType: string;
  diskSize: number;
  snapshotId?: string;
  index?: number;
}
export interface ITencentForwardLoadBalancerTargetAttribute {
  port: number;
  weight: number;
}
export interface ITencentForwardLoadBalancer {
  loadBalancerId: string;
  listenerId: string;
  locationId?: string;
  targetAttributes: ITencentForwardLoadBalancerTargetAttribute[];
}
export interface ITencentInternetAccessible {
  internetChargeType: string;
  internetMaxBandwidthOut: number;
  publicIpAssigned: boolean;
}
export interface ITencentServerGroupCommand extends IServerGroupCommand {
  detail: string;
  subnetIds: string[];
  internetAccessible: ITencentInternetAccessible;
  systemDisk: ITencentDisk;
  dataDisks: ITencentDisk[];
  osPlatform: string;
  forwardLoadBalancers: ITencentForwardLoadBalancer[];
  loadBalancerId: string;
  listenerId: string;
  locationId: string;
  port: number;
  weight: number;
  associatePublicIpAddress: boolean;
  backingData: ITencentServerGroupCommandBackingData;
  copySourceCustomBlockDeviceMappings: boolean;
  ebsOptimized: boolean;
  healthCheckGracePeriod: number;
  enhancedService: {
    monitorService: {
      enabled: boolean;
    };
    securityService: {
      enabled: boolean;
    };
  };
  keyPair: string;
  legacyUdf?: boolean;
  targetHealthyDeployPercentage: number;
  useAmiBlockDeviceMappings: boolean;
  targetGroups: string[];
  spelTargetGroups: string[];
  spelLoadBalancers: string[];
  viewState: ITencentServerGroupCommandViewState;

  getBlockDeviceMappingsSource: (command: IServerGroupCommand) => IBlockDeviceMappingSource;
  selectBlockDeviceMappingsSource: (command: IServerGroupCommand, selection: string) => void;
  usePreferredZonesChanged: (command: IServerGroupCommand) => ITencentServerGroupCommandResult;
  clusterChanged: (command: IServerGroupCommand) => void;
  regionIsDeprecated: (command: IServerGroupCommand) => boolean;
  vpcIdChanged: (command: IServerGroupCommand) => IServerGroupCommandResult;
  loadBalancerChanged: (command: ITencentServerGroupCommand) => IServerGroupCommandResult;
}

export class AwsServerGroupConfigurationService {
  private enabledMetrics = [
    'GroupMinSize',
    'GroupMaxSize',
    'GroupDesiredCapacity',
    'GroupInServiceInstances',
    'GroupPendingInstances',
    'GroupStandbyInstances',
    'GroupTerminatingInstances',
    'GroupTotalInstances',
  ];
  private terminationPolicies = ['OLDEST_INSTANCE', 'NEWEST_INSTANCE'];
  private diskTypes = ['CLOUD_BASIC', 'CLOUD_PREMIUM', 'CLOUD_SSD'];
  public static $inject = [
    'securityGroupReader',
    'tencentInstanceTypeService',
    'cacheInitializer',
    'loadBalancerReader',
    'serverGroupCommandRegistry',
  ];
  constructor(
    private securityGroupReader: SecurityGroupReader,
    private tencentInstanceTypeService: any,
    private cacheInitializer: CacheInitializerService,
    private loadBalancerReader: LoadBalancerReader,
    private serverGroupCommandRegistry: ServerGroupCommandRegistry,
  ) {}

  public configureUpdateCommand(command: ITencentServerGroupCommand): void {
    command.backingData = {
      enabledMetrics: clone(this.enabledMetrics),
      terminationPolicies: clone(this.terminationPolicies),
      diskTypes: clone(this.diskTypes),
    } as ITencentServerGroupCommandBackingData;
  }

  public configureCommand(application: Application, cmd: ITencentServerGroupCommand): IPromise<void> {
    this.applyOverrides('beforeConfiguration', cmd);
    // TODO: Instead of attaching these to the command itself, they could be static methods
    cmd.toggleSuspendedProcess = (command: ITencentServerGroupCommand, process: string): void => {
      command.suspendedProcesses = command.suspendedProcesses || [];
      const processIndex = command.suspendedProcesses.indexOf(process);
      if (processIndex === -1) {
        command.suspendedProcesses = command.suspendedProcesses.concat(process);
      } else {
        command.suspendedProcesses = command.suspendedProcesses.filter(p => p !== process);
      }
    };

    cmd.processIsSuspended = (command: ITencentServerGroupCommand, process: string): boolean =>
      command.suspendedProcesses.includes(process);

    cmd.onStrategyChange = (command: ITencentServerGroupCommand, strategy: IDeploymentStrategy): void => {
      // Any strategy other than None or Custom should force traffic to be enabled
      if (strategy.key !== '' && strategy.key !== 'custom') {
        command.suspendedProcesses = (command.suspendedProcesses || []).filter(p => p !== 'AddToLoadBalancer');
      }
    };

    cmd.getBlockDeviceMappingsSource = (command: ITencentServerGroupCommand): IBlockDeviceMappingSource => {
      if (command.copySourceCustomBlockDeviceMappings) {
        return 'source';
      } else if (command.useAmiBlockDeviceMappings) {
        return 'ami';
      }
      return 'default';
    };

    cmd.selectBlockDeviceMappingsSource = (command: ITencentServerGroupCommand, selection: string): void => {
      if (selection === 'source') {
        // copy block device mappings from source asg
        command.copySourceCustomBlockDeviceMappings = true;
        command.useAmiBlockDeviceMappings = false;
      } else if (selection === 'ami') {
        // use block device mappings from selected ami
        command.copySourceCustomBlockDeviceMappings = false;
        command.useAmiBlockDeviceMappings = true;
      } else {
        // use default block device mappings for selected instance type
        command.copySourceCustomBlockDeviceMappings = false;
        command.useAmiBlockDeviceMappings = false;
      }
    };

    cmd.regionIsDeprecated = (command: ITencentServerGroupCommand): boolean => {
      return (
        has(command, 'backingData.filtered.regions') &&
        command.backingData.filtered.regions.some(region => region.name === command.region && region.deprecated)
      );
    };

    return $q
      .all({
        credentialsKeyedByAccount: AccountService.getCredentialsKeyedByAccount('tencent'),
        securityGroups: this.securityGroupReader.getAllSecurityGroups(),
        vpcList: VpcReader.listVpcs(),
        subnets: SubnetReader.listSubnetsByProvider('tencent'),
        loadBalancers: this.loadBalancerReader.listLoadBalancers('tencent'),
        preferredZones: AccountService.getPreferredZonesByAccount('tencent'),
        keyPairs: KeyPairsReader.listKeyPairs(),
        instanceTypes: this.tencentInstanceTypeService.getAllTypesByRegion(),
        enabledMetrics: $q.when(clone(this.enabledMetrics)),
        terminationPolicies: $q.when(clone(this.terminationPolicies)),
        diskTypes: $q.when(clone(this.diskTypes)),
      })
      .then((backingData: Partial<ITencentServerGroupCommandBackingData>) => {
        let securityGroupReloader = $q.when();
        backingData.accounts = keys(backingData.credentialsKeyedByAccount);
        backingData.filtered = {} as ITencentServerGroupCommandBackingDataFiltered;
        backingData.scalingProcesses = AutoScalingProcessService.listProcesses();
        backingData.appLoadBalancers = application.getDataSource('loadBalancers').data;
        cmd.backingData = backingData as ITencentServerGroupCommandBackingData;
        backingData.filtered.securityGroups = this.getRegionalSecurityGroups(cmd);
        if (cmd.viewState.disableImageSelection) {
          this.configureInstanceTypes(cmd);
        }
        if (backingData.loadBalancers && backingData.loadBalancers.length) {
          this.configureLoadBalancerOptions(cmd);
        }
        if (cmd.securityGroups && cmd.securityGroups.length) {
          const regionalSecurityGroupIds = map(this.getRegionalSecurityGroups(cmd), 'id');
          if (intersection(cmd.securityGroups, regionalSecurityGroupIds).length < cmd.securityGroups.length) {
            securityGroupReloader = this.refreshSecurityGroups(cmd, true);
          }
        }

        return securityGroupReloader.then(() => {
          this.applyOverrides('afterConfiguration', cmd);
          this.attachEventHandlers(cmd);
        });
      });
  }

  public applyOverrides(phase: string, command: ITencentServerGroupCommand): void {
    this.serverGroupCommandRegistry.getCommandOverrides('tencent').forEach((override: any) => {
      if (override[phase]) {
        override[phase](command);
      }
    });
  }

  public configureKeyPairs(command: ITencentServerGroupCommand): IServerGroupCommandResult {
    const result: ITencentServerGroupCommandResult = { dirty: {} };
    if (command.credentials && command.region) {
      // isDefault is imperfect, since we don't know what the previous account/region was, but probably a safe bet
      const isDefault = some<any>(
        command.backingData.credentialsKeyedByAccount,
        c =>
          c.defaultKeyPair &&
          command.keyPair &&
          command.keyPair.indexOf(c.defaultKeyPair.replace('{{region}}', '')) === 0,
      );
      const filtered = chain(command.backingData.keyPairs)
        .filter({ account: command.credentials, region: command.region })
        .value();
      if (command.keyPair && filtered.length && !filtered.find(item => item.keyId === command.keyPair)) {
        const acct: IAccountDetails =
          command.backingData.credentialsKeyedByAccount[command.credentials] ||
          ({
            regions: [],
            defaultKeyPair: null,
          } as IAccountDetails);
        if (acct.defaultKeyPair) {
          // {{region}} is the only supported substitution pattern
          const defaultKeyPair = acct.defaultKeyPair.replace('{{region}}', command.region);
          if (isDefault && filtered.find(item => item.keyId === defaultKeyPair)) {
            command.keyPair = defaultKeyPair;
          } else {
            command.keyPair = null;
            result.dirty.keyPair = true;
          }
        } else {
          command.keyPair = null;
          result.dirty.keyPair = true;
        }
      }
      command.backingData.filtered.keyPairs = filtered;
    } else {
      command.backingData.filtered.keyPairs = [];
    }
    return result;
  }

  public configureInstanceTypes(command: ITencentServerGroupCommand): IServerGroupCommandResult {
    const result: ITencentServerGroupCommandResult = { dirty: {} };
    const filtered = this.tencentInstanceTypeService.getAvailableTypesForRegions(command.backingData.instanceTypes, [
      command.region,
    ]);
    if (command.instanceType && !filtered.includes(command.instanceType)) {
      result.dirty.instanceType = command.instanceType;
      command.instanceType = null;
    }
    command.backingData.filtered.instanceTypes = filtered;
    extend(command.viewState.dirty, result.dirty);
    return result;
  }

  public configureImages(command: ITencentServerGroupCommand): IServerGroupCommandResult {
    const result: ITencentServerGroupCommandResult = { dirty: {} };
    if (command.viewState.disableImageSelection) {
      return result;
    }
    if (command.amiName && !command.region) {
      result.dirty.amiName = true;
      command.amiName = null;
    }
    return result;
  }

  public configureAvailabilityZones(command: ITencentServerGroupCommand): void {
    command.backingData.filtered.availabilityZones = find<IRegion>(
      command.backingData.credentialsKeyedByAccount[command.credentials].regions,
      { name: command.region },
    ).availabilityZones;
  }

  public configureVpcList(command: ITencentServerGroupCommand): IServerGroupCommandResult {
    const result: ITencentServerGroupCommandResult = { dirty: {} };
    const filteredData = command.backingData.filtered;
    if (command.region === null) {
      return result;
    }
    filteredData.vpcList = chain(command.backingData.vpcList)
      .filter({ account: command.credentials, region: command.region })
      .value();
    if (
      !command.vpcId ||
      (filteredData.vpcList.length && !filteredData.vpcList.find(vpc => vpc.id === command.vpcId))
    ) {
      command.vpcId = filteredData.vpcList[0].id;
      command.vpcIdChanged(command);
    }
    return result;
  }

  public configureSubnetPurposes(command: ITencentServerGroupCommand): IServerGroupCommandResult {
    const result: ITencentServerGroupCommandResult = { dirty: {} };
    if (command.region === null) {
      return result;
    }
    command.backingData.filtered.subnetPurposes = chain(command.backingData.subnets)
      .filter({ account: command.credentials, region: command.region, vpcId: command.vpcId })
      .value();
    if (
      !command.subnetIds.every(subnetId =>
        // @ts-ignore
        command.backingData.filtered.subnetPurposes.find(subnet => subnet.id === subnetId),
      )
    ) {
      command.subnetIds = [];
    }
    return result;
  }

  public getRegionalSecurityGroups(command: ITencentServerGroupCommand): ISecurityGroup[] {
    const newSecurityGroups = command.backingData.securityGroups[command.credentials] || { tencent: {} };
    return chain(newSecurityGroups.tencent[command.region])
      .sortBy('name')
      .value();
  }

  public configureSecurityGroupOptions(command: ITencentServerGroupCommand): IServerGroupCommandResult {
    const result: ITencentServerGroupCommandResult = { dirty: {} };
    const currentOptions: ISecurityGroup[] = command.backingData.filtered.securityGroups;
    const newRegionalSecurityGroups = this.getRegionalSecurityGroups(command);
    const isExpression =
      typeof command.securityGroups === 'string' && (command.securityGroups as string).includes('${');
    if (currentOptions && command.securityGroups && !isExpression) {
      // not initializing - we are actually changing groups
      const currentGroupNames = command.securityGroups.map(groupId => {
        const match = find(currentOptions, { id: groupId });
        return match ? match.name : groupId;
      });

      const matchedGroups = command.securityGroups
        .map(groupId => {
          const securityGroup = find(currentOptions, { id: groupId }) || find(currentOptions, { name: groupId });
          return securityGroup ? securityGroup.name : null;
        })
        .map(groupName => find(newRegionalSecurityGroups, { name: groupName }))
        .filter(group => group);

      const matchedGroupNames = map(matchedGroups, 'name');
      const removed = xor(currentGroupNames, matchedGroupNames);
      command.securityGroups = map(matchedGroups, 'id');
      if (removed.length) {
        result.dirty.securityGroups = removed;
      }
    }
    command.backingData.filtered.securityGroups = newRegionalSecurityGroups.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return result;
  }

  public refreshSecurityGroups(
    command: ITencentServerGroupCommand,
    skipCommandReconfiguration?: boolean,
  ): IPromise<void> {
    return this.cacheInitializer.refreshCache('securityGroups').then(() => {
      return this.securityGroupReader.getAllSecurityGroups().then(securityGroups => {
        command.backingData.securityGroups = securityGroups;
        if (!skipCommandReconfiguration) {
          this.configureSecurityGroupOptions(command);
        }
      });
    });
  }

  private getLoadBalancerMap(command: ITencentServerGroupCommand): ITencentLoadBalancerSourceData[] {
    if (command.backingData.loadBalancers) {
      return chain(command.backingData.loadBalancers)
        .map('accounts')
        .flattenDeep()
        .filter({ name: command.credentials })
        .map('regions')
        .flattenDeep()
        .filter({ name: command.region })
        .map<ITencentLoadBalancerSourceData>('loadBalancers')
        .flattenDeep<ITencentLoadBalancerSourceData>()
        .value();
    }

    const appLoadBalancers = command.backingData.appLoadBalancers || [];
    return appLoadBalancers.filter(lb => lb.region === command.region && lb.account === command.credentials);
  }

  public configureLoadBalancerOptions(command: ITencentServerGroupCommand): IServerGroupCommandResult {
    const result: ITencentServerGroupCommandResult = { dirty: {} };
    const newLoadBalancers = this.getLoadBalancerMap(command).filter(lb => lb.vpcId === command.vpcId);
    command.backingData.filtered.lbList = newLoadBalancers;
    command.backingData.filtered.lbListenerMap = {};
    if (
      command.forwardLoadBalancers &&
      // @ts-ignore
      command.forwardLoadBalancers.every(flb => newLoadBalancers.find(nlb => nlb.id === flb.loadBalancerId))
    ) {
      this.refreshLoadBalancerListenerMap(command);
    } else {
      command.forwardLoadBalancers = [];
    }
    return result;
  }

  public refreshLoadBalancerListenerMap(command: ITencentServerGroupCommand) {
    return Promise.all(
      command.backingData.filtered.lbList.map(flb =>
        this.loadBalancerReader
          .getLoadBalancerDetails('tencent', command.credentials, command.region, flb.id)
          .then((loadBalancers: any) => ({
            [flb.id]: (loadBalancers && loadBalancers[0] && loadBalancers[0].listeners) || [],
          })),
      ),
    ).then(lbListenerMapArray => {
      command.backingData.filtered.lbListenerMap =
        lbListenerMapArray && lbListenerMapArray.length
          ? lbListenerMapArray.reduce((p, c) => ({ ...p, ...c }), {})
          : {};
    });
  }

  public configureListenerOptions(command: ITencentServerGroupCommand): IServerGroupCommandResult {
    const result: ITencentServerGroupCommandResult = { dirty: {} };
    command.backingData.filtered.listenerList = command.backingData.listenerList;
    return result;
  }

  public refreshListeners(command: ITencentServerGroupCommand) {
    return this.loadBalancerReader
      .getLoadBalancerDetails('tencent', command.credentials, command.region, command.loadBalancerId)
      .then((loadBalancers: any) => {
        command.backingData.listenerList = (loadBalancers && loadBalancers[0] && loadBalancers[0].listeners) || [];
        this.configureListenerOptions(command);
      });
  }

  // TODO: Instead of attaching these to the command itself, they could be static methods
  public attachEventHandlers(cmd: ITencentServerGroupCommand): void {
    cmd.usePreferredZonesChanged = (command: ITencentServerGroupCommand): ITencentServerGroupCommandResult => {
      const currentZoneCount = command.availabilityZones ? command.availabilityZones.length : 0;
      const result: ITencentServerGroupCommandResult = { dirty: {} };
      const preferredZonesForAccount = command.backingData.preferredZones[command.credentials];
      if (preferredZonesForAccount && preferredZonesForAccount[command.region] && command.viewState.usePreferredZones) {
        command.availabilityZones = cloneDeep(preferredZonesForAccount[command.region].sort());
      } else {
        command.availabilityZones = intersection(
          command.availabilityZones,
          command.backingData.filtered.availabilityZones,
        );
        const newZoneCount = command.availabilityZones ? command.availabilityZones.length : 0;
        if (currentZoneCount !== newZoneCount) {
          result.dirty.availabilityZones = true;
        }
      }
      return result;
    };

    cmd.vpcIdChanged = (command: ITencentServerGroupCommand): IServerGroupCommandResult => {
      const result: ITencentServerGroupCommandResult = { dirty: {} };
      extend(result.dirty, this.configureSubnetPurposes(command).dirty);
      extend(result.dirty, this.configureLoadBalancerOptions(command).dirty);
      command.viewState.dirty = command.viewState.dirty || {};
      extend(command.viewState.dirty, result.dirty);
      return result;
    };

    cmd.subnetChanged = (): IServerGroupCommandResult => {
      const result: ITencentServerGroupCommandResult = { dirty: {} };
      return result;
    };

    cmd.loadBalancerChanged = (command: ITencentServerGroupCommand): IServerGroupCommandResult => {
      const result: ITencentServerGroupCommandResult = { dirty: {} };
      extend(result.dirty, this.configureListenerOptions(command).dirty);
      return result;
    };

    cmd.regionChanged = (command: ITencentServerGroupCommand): IServerGroupCommandResult => {
      const result: ITencentServerGroupCommandResult = { dirty: {} };
      const filteredData = command.backingData.filtered;
      extend(result.dirty, this.configureVpcList(command).dirty);
      if (command.region) {
        extend(result.dirty, command.subnetChanged(command).dirty);
        extend(result.dirty, this.configureInstanceTypes(command).dirty);

        extend(result.dirty, command.usePreferredZonesChanged(command).dirty);

        extend(result.dirty, this.configureImages(command).dirty);
        extend(result.dirty, this.configureKeyPairs(command).dirty);
      } else {
        filteredData.regionalAvailabilityZones = null;
      }

      return result;
    };

    cmd.clusterChanged = (command: ITencentServerGroupCommand): void => {
      command.moniker = NameUtils.getMoniker(command.application, command.stack, command.detail);
    };

    cmd.credentialsChanged = (command: ITencentServerGroupCommand): IServerGroupCommandResult => {
      const result: ITencentServerGroupCommandResult = { dirty: {} };
      const backingData = command.backingData;
      if (command.credentials) {
        const regionsForAccount: IAccountDetails =
          backingData.credentialsKeyedByAccount[command.credentials] ||
          ({ regions: [], defaultKeyPair: null } as IAccountDetails);
        backingData.filtered.regions = regionsForAccount.regions;
        if (!some(backingData.filtered.regions, { name: command.region })) {
          command.region = null;
          result.dirty.region = true;
        } else {
          extend(result.dirty, command.regionChanged(command).dirty);
        }
      } else {
        command.region = null;
      }
      return result;
    };

    cmd.imageChanged = (command: ITencentServerGroupCommand): IServerGroupCommandResult =>
      this.configureInstanceTypes(command);

    cmd.instanceTypeChanged = (command: ITencentServerGroupCommand): void => {
      command.ebsOptimized = this.tencentInstanceTypeService.isEbsOptimized(command.instanceType);
    };

    this.applyOverrides('attachEventHandlers', cmd);
  }
}

export const AWS_SERVER_GROUP_CONFIGURATION_SERVICE = 'spinnaker.tencent.serverGroup.configure.service';
module(AWS_SERVER_GROUP_CONFIGURATION_SERVICE, [
  SECURITY_GROUP_READER,
  require('tencent/instance/tencentInstanceType.service').name,
  LOAD_BALANCER_READ_SERVICE,
  CACHE_INITIALIZER_SERVICE,
  SERVER_GROUP_COMMAND_REGISTRY_PROVIDER,
]).service('tencentServerGroupConfigurationService', AwsServerGroupConfigurationService);
