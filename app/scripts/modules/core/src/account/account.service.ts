import { chain, intersection, zipObject } from 'lodash';
import { ILogService, IPromise, IQResolveReject, IQService, module } from 'angular';

import { Application } from 'core/application/application.model';
import { API_SERVICE, Api } from 'core/api/api.service';
import { CLOUD_PROVIDER_REGISTRY, CloudProviderRegistry } from '../cloudProvider/cloudProvider.registry';
import { SETTINGS } from 'core/config/settings';

export interface IRegion {
  account?: string;
  availabilityZones?: string[];
  deprecated?: boolean;
  endpoint?: string;
  faultDomains?: string[];
  name: string;
  preferredZones?: string[];
}

export interface IAccount {
  accountId: string;
  name: string;
  requiredGroupMembership: string[];
  type: string;
  providerVersion?: string;
}

export interface IAccountDetails extends IAccount {
  accountType: string;
  awsAccount?: string;
  awsVpc?: string;
  challengeDestructiveActions: boolean;
  cloudProvider: string;
  defaultKeyPair?: string;
  environment: string;
  primaryAccount: boolean;
  regions: IRegion[];
  namespaces?: string[];
}

export interface IAggregatedAccounts {
  [credentials: string]: IAccountDetails;
}

export interface IZone {
  [key: string]: string[];
}

export interface IAccountZone {
  [key: string]: IZone;
}

export class AccountService {

  private accountCache: IPromise<IAccountDetails[]>;

  constructor(private $log: ILogService,
              private $q: IQService,
              private cloudProviderRegistry: CloudProviderRegistry,
              private API: Api) {
    'ngInject';
  }

  public challengeDestructiveActions(account: string): IPromise<boolean> {
    return this.$q((resolve: IQResolveReject<boolean>) => {
      if (account) {
        this.getAccountDetails(account)
          .then((details: IAccountDetails) => {
            if (details) {
              resolve(details.challengeDestructiveActions);
            } else {
              resolve(false);
            }
          })
          .catch(() => resolve(false));
      } else {
        resolve(false);
      }
    });
  }

  public getArtifactAccounts(): IPromise<IAccount[]> {
    return this.API.one('artifacts')
      .one('credentials')
      .useCache()
      .get();
  }

  public getAccountDetails(account: string): IPromise<IAccountDetails> {
    return this.listAccounts().then(accounts => accounts.find(a => a.name === account));
  }

  public getAllAccountDetailsForProvider(provider: string, providerVersion: string = null): IPromise<IAccountDetails[]> {
    return this.listAccounts(provider, providerVersion)
      .catch((error: any) => {
        this.$log.warn(`Failed to load accounts for provider "${provider}"; exception:`, error);
        return [];
      });
  }

  public getAvailabilityZonesForAccountAndRegion(provider: string, account: string, region: string): IPromise<string[]> {
    return this.getPreferredZonesByAccount(provider)
      .then((result: IAccountZone) => result[account] ? result[account][region] : []);
  }

  public getCredentialsKeyedByAccount(provider: string = null): IPromise<IAggregatedAccounts> {
    return this.listAccounts(provider)
      .then((accounts: IAccountDetails[]) => {
        const names: string[] = accounts.map((account: IAccount) => account.name);
        return zipObject<IAccountDetails, IAggregatedAccounts>(names, accounts);
      });
  }

  public getPreferredZonesByAccount(provider: string): IPromise<IAccountZone> {
    const preferred: IAccountZone = {};
    return this.getAllAccountDetailsForProvider(provider)
      .then((accounts: IAccountDetails[]) => {
        accounts.forEach((account: IAccountDetails) => {
          preferred[account.name] = {};
          account.regions.forEach((region: IRegion) => {
            let zones: string[] = region.availabilityZones;
            if (region.preferredZones) {
              zones = intersection(region.preferredZones, region.availabilityZones);
            }

            preferred[account.name][region.name] = zones;
          });
        });

        return preferred;
      });
  }

  public getRegionsForAccount(account: string): IPromise<IRegion[]> {
    return this.getAccountDetails(account)
      .then((details: IAccountDetails) => details ? details.regions : []);
  }

  public getUniqueAttributeForAllAccounts(provider: string, attribute: string): IPromise<string[]> {
    return this.getCredentialsKeyedByAccount(provider)
      .then((credentials: IAggregatedAccounts) => {
        return chain(credentials)
          .map(attribute)
          .flatten().compact()
          .map((region: IRegion) => region.name || region)
          .uniq()
          .value() as string[];
      });
  }

  public listAccounts(provider: string = null, providerVersion: string = null): IPromise<IAccountDetails[]> {
    if (!this.accountCache) {
      this.accountCache = this.API.one('credentials').withParams({ expand: true }).get();
    }
    let result: IPromise<IAccountDetails[]> = this.accountCache;
    if (provider) {
      result = result.then((accounts) => accounts.filter((account) => account.type === provider));
    }

    if (providerVersion) {
      result = result.then((accounts) => accounts.filter((account) => account.providerVersion === providerVersion));
    }

    return result;
  }

  public listProviders(application: Application = null): IPromise<string[]> {
    return this.listAccounts()
      .then((accounts: IAccount[]) => {
        const all: string[] = Array.from(new Set(accounts.map((account: IAccount) => account.type)));
        const available: string[] = intersection(all, this.cloudProviderRegistry.listRegisteredProviders());
        let result: string[];
        if (application) {
          if (application.attributes.cloudProviders.length) {
            result = application.attributes.cloudProviders;
          } else {
            if (SETTINGS.defaultProviders) {
              result = SETTINGS.defaultProviders;
            } else {
              result = available;
            }
          }

          result = intersection(available, result);
        } else {
          result = available;
        }

        return result.sort();
      });
  }
}

export const ACCOUNT_SERVICE = 'spinnaker.core.account.service';
module(ACCOUNT_SERVICE, [
  CLOUD_PROVIDER_REGISTRY,
  API_SERVICE
])
  .service('accountService', AccountService);
