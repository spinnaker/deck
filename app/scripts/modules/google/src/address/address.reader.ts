import { IPromise, module } from 'angular';

import {
  INFRASTRUCTURE_CACHE_SERVICE,
  InfrastructureCacheService,
  ISearchResults,
  SEARCH_SERVICE,
  SearchService
} from '@spinnaker/core';

interface IAddressSearchResults {
  account: string;
  address: string; // JSON encoded string containing the address. It is missing the account.
  name: string;
  provider: string;
  region: string;
  type: string;
}

export interface IGceAddress {
  account?: string;
  address: string;
  creationTimestamp?: string;
  description?: string;
  id?: number;
  kind?: string;
  labelFingerprint?: string;
  name?: string;
  networkTier?: string;
  region?: string;
  selfLink?: string;
  status?: string;
}

class GceAddressReader {
  constructor (private searchService: SearchService, private infrastructureCaches: InfrastructureCacheService) { 'ngInject'; }

  public listAddresses(region?: string): IPromise<IGceAddress[]> {
    if (region) {
      return this.listAddresses(null /* region */).then(addresses => addresses.filter(address => address.region === region));
    } else {
      return this.searchService
        .search<IAddressSearchResults>({q: '', type: 'addresses'}, this.infrastructureCaches.get('addresses'))
        .then((searchResults: ISearchResults<IAddressSearchResults>) => {
          if (searchResults && searchResults.results) {
            return searchResults.results
              .filter(result => result.provider === 'gce')
              .map(result => {
                const address = JSON.parse(result.address) as IGceAddress;
                address.account = result.account;
                address.region = result.region;
                return address;
              });
          } else {
            return [];
          }
        })
        .catch(() => []);
    }
  }
}

export const GCE_ADDRESS_READER = 'spinnaker.gce.addressReader.service';
module(GCE_ADDRESS_READER, [SEARCH_SERVICE, INFRASTRUCTURE_CACHE_SERVICE])
  .service('gceAddressReader', GceAddressReader);
