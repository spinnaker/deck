import { uniq } from 'lodash';
import { module } from 'angular';

import {
  ACCOUNT_SERVICE, AccountService, IAccountDetails, IRegion,
  IAggregatedAccounts
} from 'core/account/account.service';
import { Application } from 'core/application/application.model';
import { ChaosMonkeyConfig, IChaosMonkeyExceptionRule } from './chaosMonkeyConfig.component';
import { IClusterMatch } from 'core/widgets/cluster/clusterMatches.component';
import { ClusterMatcher, IClusterMatchRule } from 'core/cluster/ClusterRuleMatcher';

import './chaosMonkeyExceptions.component.less';

export class ChaosMonkeyExceptionsController {

  public application: Application;
  public accounts: IAccountDetails[] = [];
  public regionsByAccount: any;
  public config: ChaosMonkeyConfig;
  public configChanged: () => void;
  public clusterMatches: IClusterMatch[][] = [];

  public constructor(private accountService: AccountService) { 'ngInject'; }

  public addException(): void {
    this.config.exceptions = this.config.exceptions || [];
    this.config.exceptions.push({ account: null, location: null, stack: null, detail: null, region: null });
    this.updateConfig();
  };

  public removeException(index: number): void {
    this.config.exceptions.splice(index, 1);
    this.updateConfig();
  };

  public $onInit(): void {
    this.accountService.getCredentialsKeyedByAccount().then((aggregated: IAggregatedAccounts) => {
      this.accounts = Object.keys(aggregated)
        .map((name: string) => aggregated[name])
        .filter((details: IAccountDetails) => details.regions);
      this.regionsByAccount = {};
      this.accounts.forEach((details: IAccountDetails) => {
        this.regionsByAccount[details.name] = ['*'].concat(details.regions.map((region: IRegion) => region.name));
      });
      this.application.getDataSource('serverGroups').ready().then(() => this.configureMatches());
    });
  }

  public configureMatches(): void {
    this.clusterMatches.length = 0;
    this.config.exceptions.forEach((exception: IChaosMonkeyExceptionRule) => {
      // the "location" field in chaos monkey exceptions is mapped as "region", so we have to massage it a bit...
      const rule: IClusterMatchRule = Object.assign({}, exception, { location: exception.region });
      this.clusterMatches.push(
        this.application.clusters
          .filter(c => c.serverGroups
            .some(s => ClusterMatcher.getMatchingRule(c.account, s.region, c.name, [rule]) !== null)
          ).map(c => {
            return {
              name: c.name,
              account: exception.account,
              regions: exception.region === '*' ? uniq(c.serverGroups.map(g => g.region)).sort() : [exception.region]
            };
          })
      );
    });
    this.clusterMatches.forEach(m => m.sort((a: IClusterMatch, b: IClusterMatch) => a.name.localeCompare(b.name)));
  }

  public updateConfig(): void {
    this.configureMatches();
    this.configChanged();
  }
}

class ChaosMonkeyExceptionsComponent implements ng.IComponentOptions {
  public bindings: any = {
    application: '=',
    config: '=',
    configChanged: '&',
  };
  public controller: any = ChaosMonkeyExceptionsController;
  public templateUrl: string = require('./chaosMonkeyExceptions.component.html');
}

export const CHAOS_MONKEY_EXCEPTIONS_COMPONENT = 'spinnaker.core.chaosMonkey.exceptions.directive';
module(CHAOS_MONKEY_EXCEPTIONS_COMPONENT, [ACCOUNT_SERVICE])
.component('chaosMonkeyExceptions', new ChaosMonkeyExceptionsComponent());
