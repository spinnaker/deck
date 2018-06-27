import { IController, IComponentOptions, module } from 'angular';

import { chain, flatten, intersection, xor } from 'lodash';

import {
  AccountService,
  CacheInitializerService,
  IAccountDetails,
  IAggregatedAccounts,
  InfrastructureCaches,
  LoadBalancerReader,
} from '@spinnaker/core';

import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { IAmazonApplicationLoadBalancer, IAmazonLoadBalancer } from '@spinnaker/amazon';

class LoadBalancerSelectorController implements IController {
  public command: any;

  public refreshTime: number;
  public refreshing = false;
  public accountChanged: Subject<void>;
  public regionChanged: Subject<void>;
  public credentials: IAggregatedAccounts;
  public loadBalancers: IAmazonLoadBalancer[];
  private subscriptions: Subscription[];

  constructor(
    private $q: ng.IQService,
    private cacheInitializer: CacheInitializerService,
    private loadBalancerReader: LoadBalancerReader,
  ) {
    'ngInject';

    this.setLoadBalancerRefreshTime();
  }

  public $onInit(): void {
    const credentialLoader: ng.IPromise<void> = AccountService.getCredentialsKeyedByAccount('titus').then(
      (credentials: IAggregatedAccounts) => {
        this.credentials = credentials;
      },
    );
    this.refreshing = true;
    const loadBalancerLoader: ng.IPromise<void> = this.loadBalancerReader
      .listLoadBalancers('aws')
      .then((loadBalancers: any[]) => {
        this.refreshing = false;
        this.loadBalancers = loadBalancers;
      });
    this.$q.all([credentialLoader, loadBalancerLoader]).then(() => this.configureLoadBalancerOptions());
    this.subscriptions = [
      this.command.viewState.accountChangedStream.subscribe(() => this.configureLoadBalancerOptions()),
      this.command.viewState.regionChangedStream.subscribe(() => this.configureLoadBalancerOptions()),
    ];
  }

  public $onDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private getCredentials(): IAccountDetails {
    return this.credentials[this.command.credentials];
  }

  private getAwsAccount(): string {
    return this.getCredentials().awsAccount;
  }

  private getRegion(): string {
    return this.command.region || (this.command.cluster ? this.command.cluster.region : null);
  }

  public getTargetGroupNames(): string[] {
    const loadBalancersV2 = this.getLoadBalancerMap().filter(
      lb => lb.loadBalancerType !== 'classic',
    ) as IAmazonApplicationLoadBalancer[];
    const instanceTargetGroups = flatten(
      loadBalancersV2.map<any>(lb => lb.targetGroups.filter(tg => tg.targetType === 'ip')),
    );
    return instanceTargetGroups.map(tg => tg.name).sort();
  }

  private getLoadBalancerMap(): IAmazonLoadBalancer[] {
    return chain(this.loadBalancers)
      .map('accounts')
      .flattenDeep()
      .filter({ name: this.getAwsAccount() })
      .map('regions')
      .flattenDeep()
      .filter({ name: this.getRegion() })
      .map<IAmazonLoadBalancer>('loadBalancers')
      .flattenDeep<IAmazonLoadBalancer>()
      .value();
  }

  public configureLoadBalancerOptions() {
    const currentTargetGroups = this.command.targetGroups || [];
    const allTargetGroups = this.getTargetGroupNames();

    if (currentTargetGroups && this.command.targetGroups) {
      const matched = intersection(allTargetGroups, currentTargetGroups);
      const removedTargetGroups = xor(matched, currentTargetGroups);
      this.command.targetGroups = intersection(allTargetGroups, matched);
      this.command.removedTargetGroups = removedTargetGroups;
    }
    this.command.backingData.filtered.targetGroups = allTargetGroups;
  }

  public setLoadBalancerRefreshTime(): void {
    this.refreshTime = InfrastructureCaches.get('loadBalancers').getStats().ageMax;
  }

  public refreshLoadBalancers(): void {
    this.cacheInitializer.refreshCache('loadBalancers').then(() => {
      return this.loadBalancerReader.listLoadBalancers('aws').then(loadBalancers => {
        this.command.backingData.loadBalancers = loadBalancers;
        this.refreshing = false;
        this.configureLoadBalancerOptions();
      });
    });
  }
}

export class LoadBalancerSelectorComponent implements IComponentOptions {
  public bindings: any = {
    command: '=',
  };
  public controller: any = LoadBalancerSelectorController;
  public templateUrl = require('./loadBalancerSelector.component.html');
}

export const TITUS_LOAD_BALANCER_SELECTOR =
  'spinnaker.titus.serverGroup.configure.wizard.loadBalancers.selector.component';
module(TITUS_LOAD_BALANCER_SELECTOR, []).component('titusLoadBalancerSelector', new LoadBalancerSelectorComponent());
