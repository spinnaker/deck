import {IAccountDetails} from 'core/account/account.service';

export interface IAppengineAccount extends IAccountDetails {
  region: string;
  supportedGitCredentialTypes: GitCredentialType[];
}

export type GitCredentialType = 'NONE' | 'HTTPS_USERNAME_PASSWORD' | 'HTTPS_GITHUB_OAUTH_TOKEN' | 'SSH';
