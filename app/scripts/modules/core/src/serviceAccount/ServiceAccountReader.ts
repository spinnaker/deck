import { IPromise } from 'angular';

import { $q } from 'ngimport';

import { API } from 'core/api/ApiService';
import { SETTINGS } from 'core/config/settings';

export interface IServiceAccount {
  name: string;
  memberOf: string[];
}

export class ServiceAccountReader {
  public static getServiceAccounts(): IPromise<IServiceAccount[]> {
    if (!SETTINGS.feature.fiatEnabled) {
      return $q.resolve([]);
    } else {
      return API.one('auth')
        .one('user')
        .one('serviceAccounts')
        .get();
    }
  }
}
