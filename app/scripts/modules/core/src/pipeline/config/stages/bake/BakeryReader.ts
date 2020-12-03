import { get, has } from 'lodash';

import { $q } from 'ngimport';

import { AccountService } from 'core/account/AccountService';
import { API } from 'core/api/ApiService';
import { SETTINGS } from 'core/config/settings';

export interface IBaseImage {
  id: string;
  shortDescription: string;
  detailedDescription: string;
  packageType: string;
  displayName: string;
}

export interface IBaseOsOptions {
  cloudProvider: string;
  baseImages: IBaseImage[];
}

export class BakeryReader {
  public static getRegions(provider: string): PromiseLike<string[]> {
    if (has(SETTINGS, `providers.${provider}.bakeryRegions`)) {
      return $q.when(get(SETTINGS, `providers.${provider}.bakeryRegions`));
    }
    return AccountService.getUniqueAttributeForAllAccounts(provider, 'regions').then((regions: string[]) =>
      regions.sort(),
    );
  }

  public static getBaseOsOptions(provider: string): PromiseLike<IBaseOsOptions> {
    return this.getAllBaseOsOptions().then((options) => {
      return options.find((o) => o.cloudProvider === provider);
    });
  }

  private static getAllBaseOsOptions(): PromiseLike<IBaseOsOptions[]> {
    return API.one('bakery', 'options').useCache().getList();
  }

  public static getBaseLabelOptions(): PromiseLike<string[]> {
    return $q.when(['release', 'candidate', 'previous', 'unstable']);
  }
}
