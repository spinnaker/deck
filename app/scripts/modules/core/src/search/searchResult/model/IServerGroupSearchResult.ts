import { ISearchResult } from 'core/search';

export interface IServerGroupSearchResult extends ISearchResult {
  account: string;
  application: string;
  cluster: string;
  detail: string;
  email?: string;
  region: string;
  sequence: string;
  serverGroup: string;
  stack: string;
  url: string;
}
