import { ILogService, IPromise, IQService, module } from 'angular';
import { map } from 'lodash';

import { SETTINGS } from 'core/config/settings';
import { AccountService, IAccountDetails } from 'core/account';
import { CloudProviderRegistry } from 'core/cloudProvider';
import { IDeckRootScope, ILoadBalancer, IServerGroup } from 'core/domain';
import { Application } from 'core/application';

export class VersionedCloudProviderService {

  private accounts: IAccountDetails[] = [];

  constructor(private $rootScope: IDeckRootScope,
              private $log: ILogService,
              private $q: IQService,
              private accountService: AccountService,
              private cloudProviderRegistry: CloudProviderRegistry) {
    'ngInject';
  }

  public getValue(cloudProvider: string, accountName: string, key: string): any {
    const account = this.accounts.find(a => a.name === accountName && a.cloudProvider === cloudProvider);
    return (account && account.providerVersion)
      ? this.cloudProviderRegistry.getValue(cloudProvider, key, account.providerVersion)
      : this.cloudProviderRegistry.getValue(cloudProvider, key);
  }

  public getInstanceProviderVersion(cloudProvider: string, instanceId: string, app: Application): IPromise<string> {
    const providerVersions = this.accounts.reduce(
      (versions, account) => {
        if (account.cloudProvider === cloudProvider && !!account.providerVersion) {
          versions.add(account.providerVersion);
        }
        return versions;
      },
      new Set<string>(),
    );

    if (providerVersions.size === 0) {
      // Rely on the cloudProviderRegistry to return the default provider implementation.
      return this.$q.resolve(null);
    } else if (providerVersions.size === 1) {
      return this.$q.resolve(Array.from(providerVersions)[0]);
    }

    return app.ready().then(() => {
      for (const serverGroup of (app.getDataSource('serverGroups').data as IServerGroup[])) {
        if (serverGroup.cloudProvider === cloudProvider && (serverGroup.instances || []).some(instance => instance.id === instanceId)) {
          return this.mapAccountToProviderVersion(serverGroup.account);
        }
      }
      for (const loadBalancer of (app.getDataSource('loadBalancers').data as ILoadBalancer[])) {
        if (loadBalancer.cloudProvider === cloudProvider) {
          if ((loadBalancer.instances || []).some(instance => instance.id === instanceId)) {
            return this.mapAccountToProviderVersion(loadBalancer.account);
          }
          // Hit a crazy Babel bug - can't return from a nested for...of loop.
          for (let i = 0; i < (loadBalancer.serverGroups || []).length; i++) {
            const serverGroup = loadBalancer.serverGroups[i];
            if (serverGroup.isDisabled
                && serverGroup.instances
                && (serverGroup.instances || []).some(instance => instance.id === instanceId)) {
              return this.mapAccountToProviderVersion(loadBalancer.account);
            }
          }
        }
      }
      return null;
    });
  }

  public initializeAccounts(): void {
    if (!SETTINGS.feature.versionedProviders) {
      return;
    }

    this.$rootScope.accountsLoading = true;
    this.accountService.getCredentialsKeyedByAccount().then(accounts => {
      this.accounts = map(accounts);
    }).catch(() => {
      this.$log.warn('Could not initialize accounts.');
    }).finally(() => {
      this.$rootScope.accountsLoading = false;
    });
  }

  private mapAccountToProviderVersion(accountName: string): string {
    const account = this.accounts.find(a => a.name === accountName);
    return account ? account.providerVersion : null;
  }
}

export const VERSIONED_CLOUD_PROVIDER_SERVICE = 'spinnaker.core.versionedCloudProvider.service';
module(VERSIONED_CLOUD_PROVIDER_SERVICE, [])
  .service('versionedCloudProviderService', VersionedCloudProviderService)
  .run((versionedCloudProviderService: VersionedCloudProviderService) => {
    'ngInject';
    versionedCloudProviderService.initializeAccounts();
  });
