import { module, IPromise, IQService } from 'angular';
import { get } from 'lodash';

import { AccountService, IAccountDetails } from 'core/account';
import { CLOUD_PROVIDER_REGISTRY, CloudProviderRegistry, ICloudProviderConfig } from 'core/cloudProvider';

export interface IVersionedCloudProvider {
  config: ICloudProviderConfig;
  isDefault?: boolean;
  name: string;
  version: string;
}

export class VersionedCloudProviderRegistry {
  private providers: IVersionedCloudProvider[] = [];
  private accounts = new Map<string, IPromise<IAccountDetails[]>>();

  constructor(private $q: IQService,
              private accountService: AccountService,
              private cloudProviderRegistry: CloudProviderRegistry) {
    'ngInject';
  }

  public registerProvider(provider: IVersionedCloudProvider): void {
    this.providers.push(provider);
    // Load account details just once.
    if (!this.accounts.has(provider.name)) {
      this.accounts.set(provider.name, this.accountService.getAllAccountDetailsForProvider(provider.name).catch(() => []));
    }
  }

  public getValue(providerName: string, account: string, key: string): IPromise<any> {
    if (!key) {
      return this.$q.resolve(null);
    }

    if (!this.providers.some(p => p.name === providerName)) {
      return this.$q.resolve(this.cloudProviderRegistry.getValue(providerName, key));
    }

    return this.accounts.get(providerName).then(details => {
      const detail = details.find(d => d.name === account);
      let provider: IVersionedCloudProvider;
      if (detail && detail.version) {
        provider = this.providers.find(p => p.name === providerName && p.version === detail.version);
      } else {
        provider = this.providers.find(p => p.name === providerName && p.isDefault);
      }

      if (provider) {
        return get(provider.config, key);
      } else {
        return this.cloudProviderRegistry.getValue(providerName, key);
      }
    });
  }
}

export const VERSIONED_CLOUD_PROVIDER_REGISTRY = 'spinnaker.core.versionedCloudProviderRegistry';
module(VERSIONED_CLOUD_PROVIDER_REGISTRY, [
  CLOUD_PROVIDER_REGISTRY,
]).service('versionedCloudProviderRegistry', VersionedCloudProviderRegistry);
