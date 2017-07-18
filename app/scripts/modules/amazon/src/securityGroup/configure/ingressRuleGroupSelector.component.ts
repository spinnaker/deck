import { IController, IComponentOptions, module } from 'angular';
import { Subject } from 'rxjs';
import { get, intersection, uniq } from 'lodash';

import { ISecurityGroupRule, ISecurityGroup, IVpc } from '@spinnaker/core';

interface IInfiniteScroll {
  currentItems: number;
}

interface IRuleCommand extends ISecurityGroupRule {
  crossAccountEnabled?: boolean;
  accountName?: string;
  vpcId?: string;
  existing: boolean;
  name: string;
}

interface ISecurityGroupCommand extends ISecurityGroup {
  regions: string[];
  credentials: string;
}

class IngressRuleSelectorController implements IController {

  public rule: IRuleCommand;
  public securityGroup: ISecurityGroupCommand;
  public accounts: string[];
  public vpcs: IVpc[];
  public regionalVpcs: { [region: string]: IVpc[] };
  public allSecurityGroups: ISecurityGroup[];
  public coordinatesChanged: Subject<void>;
  public allSecurityGroupsUpdated: Subject<void>;
  public availableSecurityGroups: string[];

  public infiniteScroll: IInfiniteScroll = {
    currentItems: 20
  };

  public addMoreItems(): void {
    this.infiniteScroll.currentItems += 20;
  }

  public resetCurrentItems(): void {
    this.infiniteScroll.currentItems = 20;
  }

  public addRegionalVpc(vpc: IVpc): void {
    const account = vpc.account;
    if (!this.regionalVpcs[account]) {
      this.regionalVpcs[account] = [];
    }
    this.regionalVpcs[account].push({
      name: vpc.name,
      region: vpc.region,
      account: account,
      id: vpc.id,
      label: vpc.label,
      deprecated: vpc.deprecated,
      cloudProvider: vpc.cloudProvider,
    });
  };

  public enableCrossAccount(): void {
    this.rule.crossAccountEnabled = true;
    this.rule.accountName = this.securityGroup.credentials;
    this.rule.vpcId = this.securityGroup.vpcId;
  };

  public disableCrossAccount(): void {
    this.rule.crossAccountEnabled = false;
    this.rule.accountName = undefined;
    this.rule.vpcId = undefined;
  };

  public $onInit(): void {
    this.setAvailableSecurityGroups();
  }

  public $onDestroy() {
    this.coordinatesChanged.unsubscribe();
    this.allSecurityGroupsUpdated.unsubscribe();
  }

  public setAvailableSecurityGroups(): void {
    const account = this.rule.accountName || this.securityGroup.credentials;
    const regions = this.securityGroup.regions;
    const vpcId = this.rule.vpcId || this.securityGroup.vpcId || null;

    let existingSecurityGroupNames: string[] = [];
    let availableSecurityGroups: string[] = [];

    if (regions.length > 1) {
      this.disableCrossAccount();
    }

    regions.forEach(region => {
      let regionalVpcId: string = null;
      if (vpcId) {
        const baseVpc: IVpc = this.vpcs.find(vpc => vpc.id === vpcId),
              regionalVpc: IVpc = this.vpcs.find(vpc => vpc.account === account && vpc.region === region && vpc.name === baseVpc.name);
        regionalVpcId = regionalVpc ? regionalVpc.id : undefined;
      }

      const regionalGroupNames = get(this.allSecurityGroups, [account, 'aws', region].join('.'), [])
        .filter(sg => sg.vpcId === regionalVpcId)
        .map(sg => sg.name);

      existingSecurityGroupNames = uniq(existingSecurityGroupNames.concat(regionalGroupNames));

      if (!availableSecurityGroups.length) {
        availableSecurityGroups = existingSecurityGroupNames;
      } else {
        availableSecurityGroups = intersection(availableSecurityGroups, regionalGroupNames);
      }
    });
    if (regions.length === 1) {
      this.configureAvailableVpcs();
    }
    this.availableSecurityGroups = availableSecurityGroups;
    if (!availableSecurityGroups.includes(this.rule.name) && !this.rule.existing) {
      this.rule.name = null;
    }
  }

  public configureAvailableVpcs(): void {
    const region = this.securityGroup.regions[0];
    const filtered = this.vpcs.filter(vpc => vpc.region === region);
    this.regionalVpcs = {};
    filtered.forEach(vpc => this.addRegionalVpc(vpc));
    this.reconcileRuleVpc(filtered);
  }

  private reconcileRuleVpc(filtered: IVpc[]): void {
    if (this.rule.vpcId && !this.rule.existing) {
      if (!this.securityGroup.vpcId) {
        this.rule.vpcId = null;
        this.rule.name = null;
        return;
      }
      const baseVpc = filtered.find(vpc => vpc.id === this.rule.vpcId),
            regionalVpc = filtered.find(vpc => vpc.account === this.rule.accountName && vpc.name === baseVpc.name);
      if (regionalVpc) {
        this.rule.vpcId = regionalVpc.id;
      } else {
        this.rule.vpcId = null;
        this.rule.name = null;
      }
    }
  }
}

const ingressRuleSelector: IComponentOptions = {
  bindings: {
    rule: '=',
    securityGroup: '=',
    accounts: '=',
    vpcs: '=',
    allSecurityGroups: '=',
    coordinatesChanged: '=',
    allSecurityGroupsUpdated: '=',
  },
  templateUrl: require('./ingressRuleGroupSelector.component.html'),
  controller: IngressRuleSelectorController
};

export const INGRESS_RULE_GROUP_SELECTOR_COMPONENT = 'spinnaker.amazon.securityGroup.configure.ingressRuleGroupSelector';
module (INGRESS_RULE_GROUP_SELECTOR_COMPONENT, []).component('ingressRuleGroupSelector', ingressRuleSelector);
