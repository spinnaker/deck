import { API } from '@spinnaker/core';

export interface IAuthenticateOidcActionConfig {
  authorizationEndpoint: string;
  authenticationRequestExtraParams?: any;
  clientId: string;
  clientSecret?: string;
  idpLogoutUrl?: string;
  issuer: string;
  scope: string;
  sessionCookieName: string;
  sessionTimeout?: number;
  tokenEndpoint: string;
  userInfoEndpoint: string;
}

export class OidcConfigReader {
  public static getOidcConfigsByApp(app: string): PromiseLike<IAuthenticateOidcActionConfig[]> {
    return API.path('oidcConfigs').query({ app }).get();
  }
}
