import { IPromise } from 'angular';

import { API } from '@spinnaker/core';
import { IAuthenticateOidcActionConfig } from 'tencentcloud/domain';

export class OidcConfigReader {
  public static getOidcConfigsByApp(app: string): IPromise<IAuthenticateOidcActionConfig[]> {
    return API.one('oidcConfigs')
      .withParams({ app })
      .getList();
  }
}
